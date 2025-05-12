import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';

const ProfileForm = () => {
  const { user } = useUser();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.emailAddresses[0]?.emailAddress || '');
  const [birthday, setBirthday] = useState('');
  const [userType, setUserType] = useState('Rider');
  const [homeLocation, setHomeLocation] = useState('');

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      await user.update({
        firstName: fullName,
        unsafeMetadata: {
          userType,
          homeLocation,
          birthday,
        },
      });
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(`Failed to save profile changes.\n\n${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div>
      <h2>Your Profile</h2>
      <input value={fullName} onChange={e => setFullName(e.target.value)} />
      <input value={email} disabled />
      <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
      <select value={userType} onChange={e => setUserType(e.target.value)}>
        <option value="Rider">Rider</option>
        <option value="Driver">Driver</option>
      </select>
      <input value={homeLocation} onChange={e => setHomeLocation(e.target.value)} />
      <button onClick={handleSaveChanges}>Save Changes</button>
    </div>
  );
};

export default ProfileForm;
