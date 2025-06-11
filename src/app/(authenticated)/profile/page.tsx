"use client";
import { useState, useEffect } from 'react';

type ProfileData = {
  username: string;
  created_at: string;
  last_login: string | null;
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfileData(data);
        setUsername(data.username);
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    setIsEditing(false);
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profileData) return <div>No profile data found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Username</h3>
              <p className="mt-1">{profileData.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
              <p className="mt-1">{new Date(profileData.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
              <p className="mt-1">
                {profileData.last_login 
                  ? new Date(profileData.last_login).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 