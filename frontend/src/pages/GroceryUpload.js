import { useState } from "react";
import "../css/GroceryUpload.css";

const GroceryUpload = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("vegetarian");
  const [unit, setUnit] = useState("kg");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !category || !type || !unit || !image) {
      setMessage("Please fill all fields and select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("type", type);
    formData.append("unit", unit);
    formData.append("file", image);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groceries/add`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Grocery added successfully!");
        setName("");
        setPrice("");
        setImage(null);
        setPreview(null);
        setCategory("");
        setType("vegetarian");
        setUnit("kg");
      } else {
        const errorData = await response.text();
        setMessage(`Failed to upload grocery: ${errorData}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error uploading grocery.");
    }
  };

  return (
    <div className="grocery-upload-container">
      <h2 className="upload-title">Upload Grocery</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Grocery Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="vegetarian">Vegetarian</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
          </select>
        </div>

        <div className="form-group">
          <label>Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="pcs">pcs</option>
            <option value="l">l</option>
            <option value="ml">ml</option>
            <option value="pack">pack</option>
          </select>
        </div>

        <div className="form-group file-input-group">
          <label>Upload Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            required 
            className="file-input" 
          />
          {preview && (
            <div className="image-preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          Upload Grocery
        </button>
      </form>
    </div>
  );
};

export default GroceryUpload;