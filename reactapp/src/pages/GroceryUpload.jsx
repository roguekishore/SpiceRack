import { useState } from "react";
import { Upload, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const GroceryUpload = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
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
      setMessageType("error");
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
      const response = await fetch(`${import.meta.env.REACT_APP_API_URL}/api/groceries/add`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Grocery added successfully!");
        setMessageType("success");
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
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error uploading grocery.");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Grocery
            </CardTitle>
            <CardDescription>Add a new grocery item to the store</CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className={`p-3 rounded-md mb-6 text-sm ${
                messageType === "success" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Grocery Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter grocery name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Vegetables, Dairy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="pcs">pcs</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    {preview ? (
                      <div className="space-y-2">
                        <img
                          src={preview}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-md object-cover"
                        />
                        <p className="text-sm text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload an image
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Grocery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroceryUpload;