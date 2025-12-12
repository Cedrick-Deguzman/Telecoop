import { useState, useEffect } from 'react';
import { Box, MapPin, Search, Plus, Edit, Wifi, WifiOff, User, X } from 'lucide-react';

interface Port {
  portNumber: number;
  status: 'available' | 'occupied' | 'faulty';
  clientId?: number;
  clientName?: string;
  clientPlan?: string;
  clientStatus?: 'active' | 'inactive';
  connectedSince?: string;
}

interface NapBox {
  id: number;
  name: string;
  location: string;
  totalPorts: number;
  availablePorts: number;
  occupiedPorts: number;
  faultyPorts: number;
  ports: Port[];
  installDate: string;
  status: 'active' | 'maintenance' | 'offline';
}

export function NapBoxes() {
  const [napBoxes, setNapBoxes] = useState<NapBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNapBox, setSelectedNapBox] = useState<NapBox | null>(null);
  const [showPortModal, setShowPortModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied' | 'faulty'>('all');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingNapBox, setEditingNapBox] = useState<NapBox | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    totalPorts: 24,
    status: 'active' as NapBox['status'],
    installDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchNapboxes = async () => {
      try {
        const res = await fetch('/api/napboxes');
        const data = await res.json();
        setNapBoxes(data);
      } catch (error) {
        console.error('Failed to fetch Napboxes', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNapboxes();
  }, []);

  if (loading) return <p>Loading Napboxes...</p>;

  const filteredNapBoxes = napBoxes.filter(nap =>
    nap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nap.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalNapBoxes = napBoxes.length;
  const totalPorts = napBoxes.reduce((sum, nap) => sum + nap.totalPorts, 0);
  const totalAvailable = napBoxes.reduce((sum, nap) => sum + nap.availablePorts, 0);
  const totalOccupied = napBoxes.reduce((sum, nap) => sum + nap.occupiedPorts, 0);

  const getStatusColor = (status: NapBox['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
    }
  };

  const getPortColor = (status: Port['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600';
      case 'occupied': return 'bg-blue-500 hover:bg-blue-600';
      case 'faulty': return 'bg-red-500 hover:bg-red-600';
    }
  };

  const handleViewPorts = (napBox: NapBox) => {
    setSelectedNapBox(napBox);
    setShowPortModal(true);
  };
  const handleAddNapBox = () => {
    setFormData({
      name: '',
      location: '',
      totalPorts: 24,
      status: 'active',
      installDate: new Date().toISOString().split('T')[0],
    });
    setEditingNapBox(null);
    setShowAddEditModal(true);
  }

  const handleSaveNapBox = async () => {
    if (!formData.name || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const method = editingNapBox ? 'PUT' : 'POST';
      const body = editingNapBox
        ? { id: editingNapBox.id, ...formData }
        : formData;

      const res = await fetch('/api/napboxes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const napbox = await res.json();

      if (!res.ok) {
        alert(napbox.error || 'Failed to save NAP box');
        return;
      }

      if (editingNapBox) {
        setNapBoxes(napBoxes.map(n => (n.id === napbox.id ? napbox : n)));
      } else {
        setNapBoxes([...napBoxes, napbox]);
      }

      setShowAddEditModal(false);
      setEditingNapBox(null);
    } catch (error) {
      console.error(error);
      alert('Failed to save NAP box');
    }
  };


  const filteredPorts = selectedNapBox?.ports.filter(port => {
    if (filterStatus === 'all') return true;
    return port.status === filterStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Box className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500">Total NAP Boxes</p>
              <p className="text-2xl mt-1">{totalNapBoxes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Wifi className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500">Total Ports</p>
              <p className="text-2xl mt-1">{totalPorts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-full">
              <WifiOff className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500">Available Ports</p>
              <p className="text-2xl mt-1">{totalAvailable}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500">Occupied Ports</p>
              <p className="text-2xl mt-1">{totalOccupied}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search NAP boxes by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleAddNapBox}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Add NAP Box
        </button>
      </div>

      {/* NAP Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNapBoxes.map((napBox) => (
          <div key={napBox.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl text-white">{napBox.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-indigo-100">
                    <MapPin size={14} />
                    <span className="text-sm">{napBox.location}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(napBox.status)}`}>
                  {napBox.status}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Port Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-2xl text-green-600">{napBox.availablePorts}</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-2xl text-blue-600">{napBox.occupiedPorts}</p>
                  <p className="text-xs text-gray-600">Occupied</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-2xl text-red-600">{napBox.faultyPorts}</p>
                  <p className="text-xs text-gray-600">Faulty</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Port Utilization</span>
                  <span>{Math.round((napBox.occupiedPorts / napBox.totalPorts) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(napBox.occupiedPorts / napBox.totalPorts) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Info */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total Ports: {napBox.totalPorts}</p>
                <p>Installed: {napBox.installDate.split('T')[0]}</p>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleViewPorts(napBox)}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Port Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Port Details Modal */}
      {showPortModal && selectedNapBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl">{selectedNapBox.name} - Port Details</h2>
                <p className="text-gray-600 mt-1">
                  <MapPin className="inline" size={16} /> {selectedNapBox.location}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPortModal(false);
                  setSelectedNapBox(null);
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All ({selectedNapBox.totalPorts})
              </button>
              <button
                onClick={() => setFilterStatus('available')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'available' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Available ({selectedNapBox.availablePorts})
              </button>
              <button
                onClick={() => setFilterStatus('occupied')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'occupied' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Occupied ({selectedNapBox.occupiedPorts})
              </button>
              <button
                onClick={() => setFilterStatus('faulty')}
                className={`px-4 py-2 rounded-lg ${filterStatus === 'faulty' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Faulty ({selectedNapBox.faultyPorts})
              </button>
            </div>

            {/* Ports Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-6">
              {filteredPorts.map((port) => (
                <div
                  key={port.portNumber}
                  className={`${getPortColor(port.status)} text-white p-3 rounded-lg cursor-pointer transition-all transform hover:scale-105`}
                  title={port.clientName || port.status}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-80">Port</div>
                    <div className="text-lg">{port.portNumber}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Connected Clients Table */}
            <div className="border-t pt-6">
              <h3 className="text-xl mb-4">Connected Clients</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600">Port</th>
                      <th className="px-4 py-3 text-left text-gray-600">Client Name</th>
                      <th className="px-4 py-3 text-left text-gray-600">Plan</th>
                      <th className="px-4 py-3 text-left text-gray-600">Connected Since</th>
                      <th className="px-4 py-3 text-left text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedNapBox.ports
                      .filter(port => port.status === 'occupied')
                      .map((port) => (
                        <tr key={port.portNumber} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Port {port.portNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">{port.clientName || 'Unknown'}</td>
                          <td className="px-4 py-3">{port.clientPlan || 'N/A'}</td>
                          <td className="px-4 py-3">{port.connectedSince ? port.connectedSince.split('T')[0] : 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                port.clientStatus === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : port.clientStatus === 'inactive'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {port.clientStatus ? port.clientStatus.charAt(0).toUpperCase() + port.clientStatus.slice(1) : 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Port Status Legend:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Faulty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit NAP Box Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl">{editingNapBox ? 'Edit NAP Box' : 'Add New NAP Box'}</h2>
              </div>
              <button
                onClick={() => {
                  setShowAddEditModal(false);
                  setEditingNapBox(null);
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNapBox(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Ports</label>
                  <input
                    type="number"
                    value={formData.totalPorts}
                    onChange={(e) => setFormData({ ...formData, totalPorts: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as NapBox['status'] })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Install Date</label>
                  <input
                    type="date"
                    value={formData.installDate}
                    onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingNapBox ? 'Save Changes' : 'Add NAP Box'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
