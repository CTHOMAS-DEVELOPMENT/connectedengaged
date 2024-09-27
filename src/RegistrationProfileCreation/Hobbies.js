import React, { useRef } from "react"; 
import { hobbyTypes } from "./images"; // Image sources for hobbies
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ArrowLeftCircleFill,
  ArrowRightCircleFill,
} from "react-bootstrap-icons";

const Hobbies = ({
  onSelectHobby,
  selected,
  defaultSize = 300,
  noTitle = false,
  noChexbox = false,
  hobbies = [], // Receive the hobbies from the parent component (translated)
}) => {
  const carouselRef = useRef(null);

  const handleSelect = (index) => {
    const newSelected = selected === index ? null : index;
    onSelectHobby(newSelected);
  };

  const scrollLeft = () => {
    carouselRef.current.scrollBy({
      left: -`${defaultSize}`,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({
      left: `${defaultSize}`,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {selected !== null ? (
        <div style={{ textAlign: "center" }}>
          <img
            src={hobbyTypes[selected]}
            alt={hobbies[selected] || "Unknown Hobby"}
            style={{
              width: "100%",
              maxHeight: `${defaultSize}px`,
              objectFit: "contain",
            }}
          />
          {!noTitle && (
            <div>
              {hobbies[selected] || "Unknown Hobby"}
            </div>
          )}
          {!noChexbox && (
            <input
              type="checkbox"
              checked={true}
              onChange={() => handleSelect(selected)}
              style={{ margin: "10px 0" }}
            />
          )}
        </div>
      ) : (
        <div>
          <div
            ref={carouselRef}
            style={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              padding: "10px",
              maxWidth: "100%",
            }}
          >
            {hobbyTypes.map((imageSrc, index) => (
              <div
                key={index}
                style={{
                  display: "inline-block",
                  textAlign: "center",
                  padding: "5px",
                }}
              >
                <img
                  src={imageSrc}
                  alt={hobbies[index] || "Unknown Hobby"}
                  onClick={() => handleSelect(index)}
                  style={{
                    width: "100%",
                    maxHeight: `${defaultSize}px`,
                    cursor: "pointer",
                    border: selected === index ? "3px solid blue" : "none",
                    objectFit: "contain",
                  }}
                />
                <div>
                  {hobbies[index] || "Unknown Hobby"}
                </div>
                <input
                  type="checkbox"
                  checked={selected === index}
                  onChange={() => handleSelect(index)}
                  style={{ margin: "10px 0" }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "10px 0",
            }}
          >
            <Button
              variant="outline-info"
              className="btn-icon"
              onClick={scrollLeft}
            >
              <ArrowLeftCircleFill size={25} />
            </Button>
            <Button
              variant="outline-info"
              className="btn-icon"
              onClick={scrollRight}
            >
              <ArrowRightCircleFill size={25} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hobbies;
