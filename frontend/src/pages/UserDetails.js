import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import "../css/UserDetails.css";

const Profile = () => {
  const { user, updateUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: ""
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updateData = {
      name: formData.name,
      email: formData.email,
      id: user.id,
    };

    if (formData.password) {
      updateData.password = formData.password;
    } else if (user?.password) {
      updateData.password = user.password;
    }

    try {
      await updateUser(updateData);
      setIsEditing(false);
      setUpdateSuccess(true);
      setUpdateError(null);
      // Optionally, set a timeout to hide the success message
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating user:", error);
      setUpdateError("Failed to update profile. Please try again.");
      setUpdateSuccess(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: ""
    });
    setIsEditing(false);
    setUpdateError(null);
  };

  const handleCloseSuccess = () => {
    setUpdateSuccess(false);
  };

  if (!user) return <div className="profile-loading">Loading profile data...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>User Profile</h2>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Security</h3>
              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="save-button">Save Changes</button>
              <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-group">
                <label>Name:</label>
                <p>{user.name}</p>
              </div>
              <div className="info-group">
                <label>Email:</label>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="info-section">
              <h3>Security</h3>
              <div className="info-group">
                <label>Password:</label>
                <p>••••••••</p>
              </div>
            </div>

            <button
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}

        {updateSuccess && (
          <div className="success-dialog">
            Profile updated successfully!
            <span className="close-button" onClick={handleCloseSuccess}>
              &times;
            </span>
          </div>
        )}

        {updateError && (
          <div className="error-dialog">
            {updateError}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;