import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../../../shared/types';
import avatarController from '../Avatar/AvatarController';

const categoryLabels: Record<TaskCategory, string> = {
  data_analysis: '数据分析',
  optimization: '优化建议',
  investigation: '异常调查',
  report: '报告生成',
  other: '其他'
};

const priorityLabels: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
};

const statusLabels: Record<TaskStatus, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500'
};

interface TaskPanelProps {
  currentData?: any;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({ currentData }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'optimization' as TaskCategory,
    priority: 'medium' as TaskPriority,
    assignee: '',
    relatedMetric: ''
  });

  const tasks = useTaskStore((state) => state.getTasks());
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const setTaskStatus = useTaskStore((state) => state.setTaskStatus);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const filterStatus = useTaskStore((state) => state.filterStatus);
  const setFilterStatus = useTaskStore((state) => state.setFilterStatus);

  // 快速创建任务（基于当前数据）
  const quickCreateTasks = [
    {
      title: '分析营收下降原因',
      description: '当前营业收入出现下降，需要深入分析原因并制定改进方案',
      category: 'investigation' as TaskCategory,
      priority: 'high' as TaskPriority,
      relatedMetric: '营业收入'
    },
    {
      title: '优化转化率',
      description: '转化率低于预期，建议优化用户漏斗和营销策略',
      category: 'optimization' as TaskCategory,
      priority: 'medium' as TaskPriority,
      relatedMetric: '转化率'
    },
    {
      title: '生成周报',
      description: '汇总本周关键业务指标，生成数据报告',
      category: 'report' as TaskCategory,
      priority: 'medium' as TaskPriority
    },
    {
      title: '调查异常订单',
      description: '发现订单量异常波动，需要调查原因',
      category: 'investigation' as TaskCategory,
      priority: 'urgent' as TaskPriority,
      relatedMetric: '订单量'
    }
  ];

  // 快速创建任务
  const handleQuickCreate = (template: typeof quickCreateTasks[0]) => {
    addTask({
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      relatedMetric: template.relatedMetric
    });

    // 数字人播报
    try {
      avatarController.speak({
        text: `已创建任务：${template.title}`,
        isStart: true,
        isEnd: true
      });
    } catch (e) {
      console.log('Avatar speak failed:', e);
    }
  };

  // 提交新任务
  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    addTask({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      assignee: formData.assignee || undefined,
      relatedMetric: formData.relatedMetric || undefined
    });

    // 重置表单
    setFormData({
      title: '',
      description: '',
      category: 'optimization',
      priority: 'medium',
      assignee: '',
      relatedMetric: ''
    });
    setShowCreateForm(false);

    // 数字人播报
    try {
      avatarController.speak({
        text: `已创建新任务：${formData.title}`,
        isStart: true,
        isEnd: true
      });
    } catch (e) {
      console.log('Avatar speak failed:', e);
    }
  };

  // 更新任务状态
  const handleStatusChange = (task: Task, status: TaskStatus) => {
    setTaskStatus(task.id, status);

    // 数字人播报
    const statusText = statusLabels[status];
    try {
      avatarController.speak({
        text: `任务"${task.title}"已标记为${statusText}`,
        isStart: true,
        isEnd: true
      });
    } catch (e) {
      console.log('Avatar speak failed:', e);
    }
  };

  // 删除任务
  const handleDelete = (id: string) => {
    deleteTask(id);
    setSelectedTask(null);
  };

  // 按状态过滤的任务
  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter(t => t.status === filterStatus);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📋</span>
          <span>任务管理</span>
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
        >
          + 新建任务
        </button>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-around px-4 py-2 border-b border-white/10">
        <div className="text-center">
          <div className="text-white font-bold">{stats.total}</div>
          <div className="text-white/60 text-xs">全部</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-bold">{stats.pending}</div>
          <div className="text-white/60 text-xs">待处理</div>
        </div>
        <div className="text-center">
          <div className="text-blue-400 font-bold">{stats.inProgress}</div>
          <div className="text-white/60 text-xs">进行中</div>
        </div>
        <div className="text-center">
          <div className="text-green-400 font-bold">{stats.completed}</div>
          <div className="text-white/60 text-xs">已完成</div>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
        <span className="text-white/60 text-xs">筛选:</span>
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-2 py-1 rounded text-xs transition ${
              filterStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {status === 'all' ? '全部' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">暂无任务</p>
            <p className="text-xs mt-1">点击"新建任务"或快速创建按钮开始</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`p-3 rounded-xl cursor-pointer transition ${
                selectedTask?.id === task.id
                  ? 'bg-blue-500/20 border border-blue-400'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium text-sm truncate">{task.title}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-xs text-white ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mt-1 line-clamp-2">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs text-white ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                    <span className="text-white/40 text-xs">{categoryLabels[task.category]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 快速创建 */}
      {filteredTasks.length === 0 && !showCreateForm && (
        <div className="px-4 pb-4">
          <div className="text-white/60 text-xs mb-2">快速创建常用任务:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickCreateTasks.map((task, index) => (
              <button
                key={index}
                onClick={() => handleQuickCreate(task)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-left transition"
              >
                <div className="text-white text-xs font-medium">{task.title}</div>
                <div className="text-white/50 text-xs mt-0.5">{priorityLabels[task.priority]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 创建任务表单 */}
      {showCreateForm && (
        <div className="p-4 border-t border-white/10">
          <h4 className="text-white font-medium mb-3">创建新任务</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="任务标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-400"
            />
            <textarea
              placeholder="任务描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-gray-800">{label}</option>
                ))}
              </select>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-gray-800">{label}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="指派给（可选）"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                创建任务
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 任务详情弹窗 */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-bold text-lg">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-white/80 text-sm">{selectedTask.description}</p>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/60">优先级:</span>
                <span className={`px-2 py-1 rounded text-white ${priorityColors[selectedTask.priority]}`}>
                  {priorityLabels[selectedTask.priority]}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/60">状态:</span>
                <span className={`px-2 py-1 rounded text-white ${statusColors[selectedTask.status]}`}>
                  {statusLabels[selectedTask.status]}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-white/60">分类:</span>
                <span className="text-white/80">{categoryLabels[selectedTask.category]}</span>
              </div>

              {selectedTask.relatedMetric && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/60">相关指标:</span>
                  <span className="text-blue-400">{selectedTask.relatedMetric}</span>
                </div>
              )}

              {selectedTask.assignee && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/60">指派给:</span>
                  <span className="text-white/80">{selectedTask.assignee}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-white/60 text-sm mb-2">更改状态:</div>
              <div className="grid grid-cols-2 gap-2">
                {(['pending', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      handleStatusChange(selectedTask, status);
                      setSelectedTask(null);
                    }}
                    disabled={selectedTask.status === status}
                    className={`py-2 rounded-lg text-sm transition ${
                      selectedTask.status === status
                        ? 'bg-white/20 text-white/50 cursor-not-allowed'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (confirm('确定要删除这个任务吗？')) {
                    handleDelete(selectedTask.id);
                  }
                }}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
              >
                删除任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPanel;
