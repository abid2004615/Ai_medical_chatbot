'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Profile page component
export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Profile data
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [injuries, setInjuries] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      router.push('/auth');
      return;
    }
    
    // Load existing profile if available
    loadProfile(sessionToken);
  }, []);

  const loadProfile = async (sessionToken: string) => {
    setLoading(true);
    try {
      // Get user_id from localStorage or use 'guest'
      const userId = localStorage.getItem('user_id') || 'guest';
      
      const response = await fetch('http://localhost:5000/api/profile/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          const profile = data.profile;
          
          // Populate form with existing data
          setName(profile.name || '');
          setAge(profile.age?.toString() || '');
          setGender(profile.gender || '');
          setWeight(profile.weight?.toString() || '');
          setHeight(profile.height?.toString() || '');
          setBloodGroup(profile.blood_group || '');
          setAllergies(profile.allergies || '');
          setConditions(profile.conditions || '');
          setMedications(profile.medications || '');
          setInjuries(profile.injuries || '');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      // Get or create user_id
      let userId = localStorage.getItem('user_id');
      if (!userId) {
        userId = 'user_' + Date.now();
        localStorage.setItem('user_id', userId);
      }

      const response = await fetch('http://localhost:5000/api/profile/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          name,
          age: parseInt(age) || null,
          gender,
          weight: parseFloat(weight) || null,
          height: parseFloat(height) || null,
          blood_group: bloodGroup,
          allergies,
          conditions,
          medications,
          injuries
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('✅ Profile saved successfully!');
        
        // Update local storage
        localStorage.setItem('user_name', name);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save profile');
      }
      
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-teal-600">MediChat</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/chat" className="text-gray-600 hover:text-teal-600">
              Chat
            </Link>
            <Link href="/profile" className="text-teal-600 font-semibold">
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            👤 Your Health Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Keep your medical information up to date for personalized care
          </p>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📋</span> Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="25"
                    min="1"
                    max="150"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="70"
                    min="10"
                    max="300"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="172"
                    min="50"
                    max="250"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🩺</span> Medical Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Penicillin, Peanuts, Dust"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List any drug, food, or environmental allergies
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chronic Conditions (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Asthma, Diabetes, Hypertension"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List any ongoing medical conditions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Cetirizine, Metformin"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List any medications you're currently taking
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Past Injuries/Surgeries (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ankle sprain, Appendectomy"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List any major injuries or surgeries
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-800">
                🔒 <strong>Privacy & Security:</strong> Your health data is stored securely and encrypted. 
                Only you can access this information, and it's used solely to provide personalized medical guidance.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : '💾 Save Profile'}
              </button>
              
              <Link
                href="/chat"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Profile Summary */}
          {name && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">📊 Profile Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="ml-2 font-medium">{age || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2 font-medium">{gender || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="ml-2 font-medium">{bloodGroup || 'Not set'}</span>
                </div>
                {weight && height && (
                  <div className="col-span-2">
                    <span className="text-gray-600">BMI:</span>
                    <span className="ml-2 font-medium">
                      {((parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2))).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
