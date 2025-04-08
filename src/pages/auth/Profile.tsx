
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-500">Email</h3>
              <p>{user?.email || 'No email available'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-500">User ID</h3>
              <p className="text-sm font-mono">{user?.id || 'Not available'}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-500">Last Sign In</h3>
              <p>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Not available'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
