const QueryExecution = require('../models/QueryExecution');
const ExecutionLog = require('../models/ExecutionLog');
const { isInMemory, getMemoryStore } = require('../config/db');

const listExecutions = async (req, res, next) => {
  try {
    const { status, feedback, search, page = 1, limit = 25 } = req.query;

    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      let execs = Array.from(memoryStore.executions.values());

      if (status) {
        execs = execs.filter(e => e.status === status);
      }
      if (feedback) {
        execs = execs.filter(e => e.feedback === feedback);
      }
      if (search) {
        const q = search.toLowerCase();
        execs = execs.filter(e => e.query.toLowerCase().includes(q) || (e.response && e.response.toLowerCase().includes(q)));
      }

      execs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const total = execs.length;
      const paginated = execs.slice((page - 1) * limit, page * limit);

      return res.status(200).json({
        success: true,
        executions: paginated,
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const query = {};
    if (status) query.status = status;
    if (feedback) query.feedback = feedback;
    if (search) {
      query.$or = [
        { query: { $regex: search, $options: 'i' } },
        { response: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await QueryExecution.countDocuments(query);
    const executions = await QueryExecution.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate('userId', 'name email role');

    res.status(200).json({
      success: true,
      executions,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getExecutionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      const execution = memoryStore.executions.get(id);
      if (!execution) {
        return res.status(404).json({ success: false, message: 'Execution record not found.' });
      }

      const logs = Array.from(memoryStore.logs.values())
        .filter(l => l.executionId.toString() === id.toString())
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return res.status(200).json({
        success: true,
        execution,
        logs,
      });
    }

    const execution = await QueryExecution.findById(id).populate('userId', 'name email role department');
    if (!execution) {
      return res.status(404).json({ success: false, message: 'Execution record not found.' });
    }

    const logs = await ExecutionLog.find({ executionId: id }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      execution,
      logs,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  listExecutions,
  getExecutionById,
};
