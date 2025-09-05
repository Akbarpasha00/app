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
  TrendingUp
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
    { title: 'Placement Rate', value: `${stats.placement_rate}%`, icon: TrendingUp, color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
        <p className="text-slate-600">Overview of placement activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

// Students Component
const Students = () => {
  const [students, setStudents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', roll_no: '', branch: '', year: 1, cgpa: 0,
    skills: '', email: '', phone: '', resume_url: ''
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
        year: parseInt(formData.year)
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
        name: '', roll_no: '', branch: '', year: 1, cgpa: 0,
        skills: '', email: '', phone: '', resume_url: ''
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Students</h2>
          <p className="text-slate-600">Manage student registrations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update student information' : 'Enter student details to register'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roll_no">Roll Number</Label>
                  <Input
                    id="roll_no"
                    value={formData.roll_no}
                    onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
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
                  <Label htmlFor="cgpa">CGPA</Label>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="JavaScript, React, Node.js"
                />
              </div>
              <div>
                <Label htmlFor="resume_url">Resume URL (optional)</Label>
                <Input
                  id="resume_url"
                  type="url"
                  value={formData.resume_url}
                  onChange={(e) => setFormData({...formData, resume_url: e.target.value})}
                  placeholder="https://example.com/resume.pdf"
                />
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
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{student.name}</h3>
                    <p className="text-slate-600">{student.roll_no} • {student.branch}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">Year {student.year}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">CGPA: {student.cgpa}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{student.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{student.phone}</span>
                  </div>
                </div>
                {student.skills.length > 0 && (
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

// Companies Component (simplified for brevity)
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

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'companies':
        return <Companies />;
      case 'drives':
        return <div className="text-center py-12"><p className="text-slate-600">Drives management coming soon...</p></div>;
      case 'applications':
        return <div className="text-center py-12"><p className="text-slate-600">Applications management coming soon...</p></div>;
      case 'offers':
        return <div className="text-center py-12"><p className="text-slate-600">Offer letters management coming soon...</p></div>;
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