import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/store/taskStore';
import { ArrowLeft, Save, User, Phone, MapPin, FileText, Calendar, Clock } from 'lucide-react';

export default function TaskNew() {
  const navigate = useNavigate();
  const { addTask } = useTaskStore();

  const [formData, setFormData] = useState({
    deceasedName: '',
    deceasedGender: 'male' as 'male' | 'female',
    deceasedAge: '',
    deceasedIdCard: '',
    causeOfDeath: '',
    hospital: '',
    familyName: '',
    familyRelation: '',
    familyPhone: '',
    pickupAddress: '',
    destination: '市殡仪馆',
    scheduledDate: '',
    scheduledTime: '',
    remarks: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
    
    addTask({
      deceased: {
        name: formData.deceasedName,
        gender: formData.deceasedGender,
        age: parseInt(formData.deceasedAge) || 0,
        idCard: formData.deceasedIdCard,
        causeOfDeath: formData.causeOfDeath,
        hospital: formData.hospital || undefined,
      },
      family: {
        name: formData.familyName,
        relation: formData.familyRelation,
        phone: formData.familyPhone,
      },
      pickupAddress: formData.pickupAddress,
      destination: formData.destination,
      scheduledTime: scheduledDateTime,
      remarks: formData.remarks,
    });

    navigate('/tasks');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">电话受理 - 新建接运任务</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">逝者信息</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                value={formData.deceasedName}
                onChange={(e) => handleChange('deceasedName', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="请输入姓名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
              <select
                value={formData.deceasedGender}
                onChange={(e) => handleChange('deceasedGender', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
              <input
                type="number"
                value={formData.deceasedAge}
                onChange={(e) => handleChange('deceasedAge', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="请输入年龄"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身份证号</label>
              <input
                type="text"
                value={formData.deceasedIdCard}
                onChange={(e) => handleChange('deceasedIdCard', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="请输入身份证号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">死亡原因</label>
              <input
                type="text"
                value={formData.causeOfDeath}
                onChange={(e) => handleChange('causeOfDeath', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="请输入死亡原因"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所在医院</label>
              <input
                type="text"
                value={formData.hospital}
                onChange={(e) => handleChange('hospital', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="选填，家中去世可不填"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">家属信息</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">家属姓名</label>
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) => handleChange('familyName', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="请输入家属姓名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">与逝者关系</label>
              <input
                type="text"
                value={formData.familyRelation}
                onChange={(e) => handleChange('familyRelation', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="如：儿子、女儿"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input
                type="tel"
                value={formData.familyPhone}
                onChange={(e) => handleChange('familyPhone', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="请输入联系电话"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">接运信息</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">接运地址</label>
              <textarea
                value={formData.pickupAddress}
                onChange={(e) => handleChange('pickupAddress', e.target.value)}
                className="w-full h-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none"
                placeholder="请输入详细接运地址"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleChange('destination', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder="请输入目的地"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预约日期</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleChange('scheduledDate', e.target.value)}
                  className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预约时间</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleChange('scheduledTime', e.target.value)}
                  className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">备注信息</h3>
          </div>
          <textarea
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none"
            placeholder="请输入其他备注信息..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存任务
          </button>
        </div>
      </form>
    </div>
  );
}
