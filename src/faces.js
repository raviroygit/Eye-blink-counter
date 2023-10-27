import React, { useState, useEffect } from "react";
import * as faceapi from "@vladmandic/face-api";

const Faces = ({ image }) => {
  const [faces, setFaces] = useState([]);

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    

    faceapi.detectSingleFace(image).then((faces) => {
      setFaces(faces);
    });
  }, [image]);

  return (
    <div>
      <canvas id="canvas" width="300" height="300" />
      {faces.map((face) => (
        <div
          key={face.id}
          style={{
            position: "absolute",
            left: face.boundingBox.left,
            top: face.boundingBox.top,
            width: face.boundingBox.width,
            height: face.boundingBox.height,
            border: "1px solid red",
          }}
        />
      ))}
    </div>
  );
};

export default Faces;