import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Icons
import { 
  Users, 
  Building2, 
  Calendar, 
  FileText, 
  BarChart3, 
  UserPlus,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  BookOpen,
  Receipt
} from 'lucide-react';

// Components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'crt', label: 'CRT Management', icon: CreditCard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'drives', label: 'Drives', icon: Calendar },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'offers', label: 'Offer Letters', icon: Download }
  ];

  return (
    <nav className="bg-slate-900 text-white p-6 min-h-screen w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">CampusHire</h1>
        <p className="text-slate-400 text-sm">Placement Management</p>
      </div>
      
      <ul className="space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.total_students, icon: Users, color: 'bg-blue-500' },
    { title: 'Companies', value: stats.total_companies, icon: Building2, color: 'bg-green-500' },
    { title: 'Active Drives', value: stats.upcoming_drives, icon: Calendar, color: 'bg-orange-500' },
    { title: 'Applications', value: stats.total_applications, icon: FileText, color: 'bg-purple-500' },
    { title: 'Selected Students', value: stats.selected_students, icon: CheckCircle, color: 'bg-emerald-500' },
    { title: 'Placement Rate', value: `${stats.placement_rate}%`, icon: TrendingUp, color: 'bg-indigo-500' },
    // CRT specific stats
    { title: 'CRT Fee Paid', value: stats.crt_fee_paid, icon: CreditCard, color: 'bg-green-600' },
    { title: 'CRT Fee Pending', value: stats.crt_fee_pending, icon: AlertCircle, color: 'bg-red-500' },
    { title: 'CRT Payment Rate', value: `${stats.crt_payment_rate}%`, icon: Receipt, color: 'bg-teal-500' },
    { title: 'Students with Backlogs', value: stats.students_with_backlogs, icon: BookOpen, color: 'bg-yellow-600' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
        <p className="text-slate-600">Overview of placement activities and CRT management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value || 0}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CRT Quick Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>CRT Management Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.crt_fee_paid || 0}</p>
              <p className="text-sm text-slate-600">Fee Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.crt_fee_pending || 0}</p>
              <p className="text-sm text-slate-600">Fee Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">{stats.crt_payment_rate || 0}%</p>
              <p className="text-sm text-slate-600">Payment Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.students_with_backlogs || 0}</p>
              <p className="text-sm text-slate-600">With Backlogs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Students Component
const Students = () => {
  const [students, setStudents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', roll_no: '', branch: '', section: '', year: 1, cgpa: 0,
    skills: '', email: '', phone: '', resume_url: '',
    // Academic Information
    ssc_percentage: 0, inter_diploma_percentage: 0, backlogs_count: 0,
    backlog_status: 'not_applicable', year_of_passing: new Date().getFullYear(),
    // CRT Information
    crt_fee_status: 'pending', crt_fee_amount: 0, crt_receipt_number: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        cgpa: parseFloat(formData.cgpa),
        year: parseInt(formData.year),
        ssc_percentage: parseFloat(formData.ssc_percentage),
        inter_diploma_percentage: parseFloat(formData.inter_diploma_percentage),
        backlogs_count: parseInt(formData.backlogs_count),
        year_of_passing: parseInt(formData.year_of_passing),
        crt_fee_amount: parseFloat(formData.crt_fee_amount)
      };

      if (editingStudent) {
        await axios.put(`${API}/students/${editingStudent.id}`, data);
        toast.success('Student updated successfully');
      } else {
        await axios.post(`${API}/students`, data);
        toast.success('Student created successfully');
      }

      setIsDialogOpen(false);
      setEditingStudent(null);
      setFormData({
        name: '', roll_no: '', branch: '', section: '', year: 1, cgpa: 0,
        skills: '', email: '', phone: '', resume_url: '',
        ssc_percentage: 0, inter_diploma_percentage: 0, backlogs_count: 0,
        backlog_status: 'not_applicable', year_of_passing: new Date().getFullYear(),
        crt_fee_status: 'pending', crt_fee_amount: 0, crt_receipt_number: ''
      });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      ...student,
      skills: student.skills.join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API}/students/${id}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const getCRTStatusBadge = (status) => {
    const statusColors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-red-100 text-red-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'exempted': 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBacklogStatusBadge = (status) => {
    const statusColors = {
      'cleared': 'bg-green-100 text-green-800',
      'pending': 'bg-red-100 text-red-800',
      'not_applicable': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Students</h2>
          <p className="text-slate-600">Manage student registrations with CRT details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update student information' : 'Enter comprehensive student details including CRT information'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="roll_no">Roll Number *</Label>
                    <Input
                      id="roll_no"
                      value={formData.roll_no}
                      onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="branch">Branch *</Label>
                    <Input
                      id="branch"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="section">Section *</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile No. *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Academic Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ssc_percentage">SSC % *</Label>
                    <Input
                      id="ssc_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.ssc_percentage}
                      onChange={(e) => setFormData({...formData, ssc_percentage: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="inter_diploma_percentage">Inter/Diploma % *</Label>
                    <Input
                      id="inter_diploma_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.inter_diploma_percentage}
                      onChange={(e) => setFormData({...formData, inter_diploma_percentage: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cgpa">B.Tech CGPA *</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="backlogs_count">Number of Backlogs</Label>
                    <Input
                      id="backlogs_count"
                      type="number"
                      min="0"
                      value={formData.backlogs_count}
                      onChange={(e) => setFormData({...formData, backlogs_count: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backlog_status">Backlog Status</Label>
                    <Select value={formData.backlog_status} onValueChange={(value) => setFormData({...formData, backlog_status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_applicable">Not Applicable</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cleared">Cleared</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year_of_passing">Year of Passing *</Label>
                    <Input
                      id="year_of_passing"
                      type="number"
                      min="2020"
                      max="2030"
                      value={formData.year_of_passing}
                      onChange={(e) => setFormData({...formData, year_of_passing: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* CRT Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  CRT Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="crt_fee_status">CRT Fee Status *</Label>
                    <Select value={formData.crt_fee_status} onValueChange={(value) => setFormData({...formData, crt_fee_status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="exempted">Exempted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="crt_fee_amount">CRT Fee Amount (₹) *</Label>
                    <Input
                      id="crt_fee_amount"
                      type="number"
                      min="0"
                      value={formData.crt_fee_amount}
                      onChange={(e) => setFormData({...formData, crt_fee_amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="crt_receipt_number">CRT Receipt Number</Label>
                    <Input
                      id="crt_receipt_number"
                      value={formData.crt_receipt_number}
                      onChange={(e) => setFormData({...formData, crt_receipt_number: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Current Year</Label>
                    <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="resume_url">Resume URL</Label>
                    <Input
                      id="resume_url"
                      type="url"
                      value={formData.resume_url}
                      onChange={(e) => setFormData({...formData, resume_url: e.target.value})}
                      placeholder="https://example.com/resume.pdf"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="JavaScript, React, Node.js, MongoDB"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingStudent ? 'Update' : 'Create'} Student
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {students.map(student => (
          <Card key={student.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{student.name}</h3>
                    <p className="text-slate-600">{student.roll_no} • {student.branch} - {student.section}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getCRTStatusBadge(student.crt_fee_status)}>
                      CRT: {student.crt_fee_status.toUpperCase()}
                    </Badge>
                    {student.backlogs_count > 0 && (
                      <Badge className={getBacklogStatusBadge(student.backlog_status)}>
                        Backlogs: {student.backlogs_count}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Academic Information Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>SSC: {student.ssc_percentage}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Inter: {student.inter_diploma_percentage}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span>CGPA: {student.cgpa}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    <span>Passing: {student.year_of_passing}</span>
                  </div>
                </div>

                {/* Contact Information Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Year {student.year}</span>
                  </div>
                </div>

                {/* CRT Information Row */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Fee: ₹{student.crt_fee_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>Receipt: {student.crt_receipt_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span>Status: {student.crt_fee_status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {student.skills && student.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(student.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// CRT Management Component
const CRTManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');
  const [crtStats, setCrtStats] = useState({});

  useEffect(() => {
    fetchStudents();
    fetchCRTStats();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, feeStatusFilter]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchCRTStats = async () => {
    try {
      const response = await axios.get(`${API}/crt/fee-status`);
      setCrtStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch CRT stats');
    }
  };

  const filterStudents = () => {
    if (feeStatusFilter === 'all') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(student => student.crt_fee_status === feeStatusFilter));
    }
  };

  const getCRTStatusBadge = (status) => {
    const statusColors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-red-100 text-red-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'exempted': 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getBacklogStatusBadge = (status) => {
    const statusColors = {
      'cleared': 'bg-green-100 text-green-800',
      'pending': 'bg-red-100 text-red-800',
      'not_applicable': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Roll Number', 'Branch', 'Section', 'Email', 'Mobile No.',
      'SSC %', 'Inter/Diploma %', 'B.Tech CGPA', 'Backlogs Count', 'Backlog Status',
      'Year of Passing', 'CRT Fee Status', 'CRT Fee Amount', 'CRT Receipt Number'
    ];
    
    const csvData = filteredStudents.map(student => [
      student.name,
      student.roll_no,
      student.branch,
      student.section,
      student.email,
      student.phone,
      student.ssc_percentage,
      student.inter_diploma_percentage,
      student.cgpa,
      student.backlogs_count,
      student.backlog_status,
      student.year_of_passing,
      student.crt_fee_status,
      student.crt_fee_amount,
      student.crt_receipt_number || ''
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crt_students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">CRT Management</h2>
          <p className="text-slate-600">Campus Recruitment Training fee and academic tracking</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* CRT Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">Fee Paid</p>
              <p className="text-2xl font-bold text-green-800">{crtStats.paid || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 mb-1">Fee Pending</p>
              <p className="text-2xl font-bold text-red-800">{crtStats.pending || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 mb-1">Partial Payment</p>
              <p className="text-2xl font-bold text-yellow-800">{crtStats.partial || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">Exempted</p>
              <p className="text-2xl font-bold text-blue-800">{crtStats.exempted || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Label htmlFor="fee-status-filter">Filter by CRT Fee Status:</Label>
          <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="paid">Fee Paid</SelectItem>
              <SelectItem value="pending">Fee Pending</SelectItem>
              <SelectItem value="partial">Partial Payment</SelectItem>
              <SelectItem value="exempted">Exempted</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{filteredStudents.length} students</Badge>
        </div>
      </Card>

      {/* Students List with Complete Information */}
      <div className="grid gap-4">
        {filteredStudents.map(student => (
          <Card key={student.id} className="p-6 border-l-4" style={{
            borderLeftColor: student.crt_fee_status === 'paid' ? '#10b981' : 
                            student.crt_fee_status === 'pending' ? '#ef4444' :
                            student.crt_fee_status === 'partial' ? '#f59e0b' : '#3b82f6'
          }}>
            <div className="space-y-4">
              {/* Header Row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{student.name}</h3>
                    <p className="text-slate-600">{student.roll_no} • {student.branch} - {student.section}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getCRTStatusBadge(student.crt_fee_status)}>
                    {student.crt_fee_status.toUpperCase()}
                  </Badge>
                  {student.backlogs_count > 0 && (
                    <Badge className={getBacklogStatusBadge(student.backlog_status)}>
                      {student.backlogs_count} Backlogs
                    </Badge>
                  )}
                </div>
              </div>

              {/* Academic Performance Section */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Academic Performance
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-slate-600">SSC %</p>
                    <p className="text-lg font-bold text-slate-800">{student.ssc_percentage}%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-600">Inter/Diploma %</p>
                    <p className="text-lg font-bold text-slate-800">{student.inter_diploma_percentage}%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-600">B.Tech CGPA</p>
                    <p className="text-lg font-bold text-slate-800">{student.cgpa}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-600">Backlogs</p>
                    <p className="text-lg font-bold text-slate-800">{student.backlogs_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-600">Passing Year</p>
                    <p className="text-lg font-bold text-slate-800">{student.year_of_passing}</p>
                  </div>
                </div>
              </div>

              {/* CRT Fee Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  CRT Fee Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-600">Fee Status</p>
                    <p className="text-lg font-bold text-blue-800">{student.crt_fee_status.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-600">Fee Amount</p>
                    <p className="text-lg font-bold text-blue-800">₹{student.crt_fee_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-600">Receipt Number</p>
                    <p className="text-lg font-bold text-blue-800">{student.crt_receipt_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{student.phone}</span>
                </div>
              </div>

              {/* Skills */}
              {student.skills && student.skills.length > 0 && (
                <div>
                  <p className="font-medium text-slate-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', website: '', industry: '', location: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API}/companies`);
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/companies`, formData);
      toast.success('Company created successfully');
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', website: '', industry: '', location: '' });
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to create company');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Companies</h2>
          <p className="text-slate-600">Manage recruiting companies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>Enter company details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Create Company
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {companies.map(company => (
          <Card key={company.id} className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{company.name}</h3>
                <p className="text-slate-600 mb-3">{company.description}</p>
                <div className="flex items-center space-x-6 text-sm text-slate-500">
                  <span>{company.industry}</span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {company.location}
                  </span>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Drives Component
const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '', role: '', job_description: '', ctc: 0,
    eligibility_criteria: '', drive_date: '', location: ''
  });

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await axios.get(`${API}/drives`);
      setDrives(response.data);
    } catch (error) {
      toast.error('Failed to fetch drives');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API}/companies`);
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to fetch companies');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        ctc: parseFloat(formData.ctc),
        drive_date: new Date(formData.drive_date).toISOString()
      };

      await axios.post(`${API}/drives`, data);
      toast.success('Drive created successfully');
      setIsDialogOpen(false);
      setFormData({
        company_id: '', role: '', job_description: '', ctc: 0,
        eligibility_criteria: '', drive_date: '', location: ''
      });
      fetchDrives();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const updateDriveStatus = async (driveId, status) => {
    try {
      await axios.put(`${API}/drives/${driveId}/status?status=${status}`);
      toast.success('Drive status updated successfully');
      fetchDrives();
    } catch (error) {
      toast.error('Failed to update drive status');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Campus Drives</h2>
          <p className="text-slate-600">Manage recruitment drives</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Drive
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Drive</DialogTitle>
              <DialogDescription>Create a new campus recruitment drive</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company_id">Company</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Job Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ctc">CTC (₹)</Label>
                  <Input
                    id="ctc"
                    type="number"
                    min="0"
                    value={formData.ctc}
                    onChange={(e) => setFormData({...formData, ctc: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="job_description">Job Description</Label>
                <Textarea
                  id="job_description"
                  value={formData.job_description}
                  onChange={(e) => setFormData({...formData, job_description: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
                <Textarea
                  id="eligibility_criteria"
                  value={formData.eligibility_criteria}
                  onChange={(e) => setFormData({...formData, eligibility_criteria: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drive_date">Drive Date & Time</Label>
                  <Input
                    id="drive_date"
                    type="datetime-local"
                    value={formData.drive_date}
                    onChange={(e) => setFormData({...formData, drive_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  Schedule Drive
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {drives.map(drive => (
          <Card key={drive.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{drive.role}</h3>
                    <p className="text-slate-600">{drive.company_name}</p>
                  </div>
                  <Badge className={getStatusBadgeColor(drive.status)}>
                    {drive.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">₹{drive.ctc.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{new Date(drive.drive_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{new Date(drive.drive_date).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{drive.location}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <h4 className="font-medium text-slate-700 mb-1">Job Description:</h4>
                  <p className="text-sm text-slate-600">{drive.job_description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Eligibility:</h4>
                  <p className="text-sm text-slate-600">{drive.eligibility_criteria}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Select onValueChange={(value) => updateDriveStatus(drive.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Applications Component
const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '', drive_id: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchStudents();
    fetchDrives();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/applications`);
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchDrives = async () => {
    try {
      const response = await axios.get(`${API}/drives`);
      setDrives(response.data);
    } catch (error) {
      toast.error('Failed to fetch drives');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/applications`, formData);
      toast.success('Application created successfully');
      setIsDialogOpen(false);
      setFormData({ student_id: '', drive_id: '' });
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await axios.put(`${API}/applications/${applicationId}/status`, { status });
      toast.success('Application status updated successfully');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Applications</h2>
          <p className="text-slate-600">Manage student applications</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <FileText className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Application</DialogTitle>
              <DialogDescription>Apply student to a drive</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="student_id">Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.roll_no})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="drive_id">Drive</Label>
                <Select value={formData.drive_id} onValueChange={(value) => setFormData({...formData, drive_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drive" />
                  </SelectTrigger>
                  <SelectContent>
                    {drives.map(drive => (
                      <SelectItem key={drive.id} value={drive.id}>
                        {drive.company_name} - {drive.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Create Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {applications.map(application => (
          <Card key={application.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{application.student_name}</h3>
                    <p className="text-slate-600">{application.company_name} - {application.role}</p>
                  </div>
                  <Badge className={getStatusBadgeColor(application.application_status)}>
                    {application.application_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Applied: {new Date(application.applied_date).toLocaleDateString()}</span>
                  </div>
                  {application.selected_date && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Selected: {new Date(application.selected_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Select onValueChange={(value) => updateApplicationStatus(application.id, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Offer Letters Component
const OfferLetters = () => {
  const [offers, setOffers] = useState([]);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewOfferDialog, setViewOfferDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '', drive_id: '', joining_date: '', final_ctc: 0
  });

  useEffect(() => {
    fetchOffers();
    fetchStudents();
    fetchDrives();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API}/offer-letters`);
      setOffers(response.data);
    } catch (error) {
      toast.error('Failed to fetch offer letters');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchDrives = async () => {
    try {
      const response = await axios.get(`${API}/drives`);
      setDrives(response.data);
    } catch (error) {
      toast.error('Failed to fetch drives');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        final_ctc: parseFloat(formData.final_ctc),
        joining_date: new Date(formData.joining_date).toISOString()
      };

      await axios.post(`${API}/offer-letters`, data);
      toast.success('Offer letter created successfully');
      setIsDialogOpen(false);
      setFormData({ student_id: '', drive_id: '', joining_date: '', final_ctc: 0 });
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const viewOffer = (offer) => {
    setSelectedOffer(offer);
    setViewOfferDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Offer Letters</h2>
          <p className="text-slate-600">Manage placement offer letters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="w-4 h-4 mr-2" />
              Generate Offer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Offer Letter</DialogTitle>
              <DialogDescription>Create offer letter for selected student</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="student_id">Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.roll_no})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="drive_id">Drive</Label>
                <Select value={formData.drive_id} onValueChange={(value) => setFormData({...formData, drive_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drive" />
                  </SelectTrigger>
                  <SelectContent>
                    {drives.map(drive => (
                      <SelectItem key={drive.id} value={drive.id}>
                        {drive.company_name} - {drive.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="final_ctc">Final CTC (₹)</Label>
                  <Input
                    id="final_ctc"
                    type="number"
                    min="0"
                    value={formData.final_ctc}
                    onChange={(e) => setFormData({...formData, final_ctc: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="joining_date">Joining Date</Label>
                  <Input
                    id="joining_date"
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Generate Offer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {offers.map(offer => (
          <Card key={offer.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Download className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{offer.student_name}</h3>
                    <p className="text-slate-600">{offer.company_name} - {offer.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>CTC: ₹{offer.final_ctc.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Offer Date: {new Date(offer.offer_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Joining: {new Date(offer.joining_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => viewOffer(offer)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Offer Dialog */}
      <Dialog open={viewOfferDialog} onOpenChange={setViewOfferDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Offer Letter</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="bg-white p-8 border rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{selectedOffer.letter_content}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'crt':
        return <CRTManagement />;
      case 'companies':
        return <Companies />;
      case 'drives':
        return <Drives />;
      case 'applications':
        return <Applications />;
      case 'offers':
        return <OfferLetters />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App min-h-screen bg-slate-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="ml-64 p-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;