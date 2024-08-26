import React, { useState } from "react";

function PhotoUploader() {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <div>
      {selectedImage ? (
        <div>
          <img
            src={selectedImage}
            alt="Uploaded"
            style={{ width: "300px", marginTop: "20px" }}
          />
          <button onClick={handleRemoveImage} style={{ display: "block", marginTop: "10px" }}>
            Удалить фотографию
          </button>
        </div>
      ) : (
        <div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
      )}
    </div>
  );
}

export default PhotoUploader;