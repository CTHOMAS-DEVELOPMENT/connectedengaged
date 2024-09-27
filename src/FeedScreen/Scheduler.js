import React, { useState } from "react";
import { Button } from "react-bootstrap";

const Scheduler = ({ onTimeSelected, onCancel }) => {
  const [selectedTime, setSelectedTime] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Clear time part to compare only dates

  const roundToNext15Minutes = (date) => {
    const ms = 1000 * 60 * 15; // 15 minutes in milliseconds
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  };

  const startTime = roundToNext15Minutes(new Date());

  const generateTimeBlocks = () => {
    const blocks = [];
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 48);

    for (
      let time = new Date(startTime);
      time <= endTime;
      time.setMinutes(time.getMinutes() + 15)
    ) {
      blocks.push(new Date(time));
    }

    return blocks;
  };

  const timeBlocks = generateTimeBlocks();

  const handleTimeClick = (time) => {
    setSelectedTime(time);
    //console.log("Clicked Time:", time);
    //console.log("Current Time:", today);
  };

  const handleConfirm = () => {
    if (selectedTime) {
      onTimeSelected(selectedTime);
    }
  };

  const formatButtonText = () => {
    if (!selectedTime) return "Schedule";

    const selectedDate = new Date(selectedTime);
    selectedDate.setHours(0, 0, 0, 0); // Clear time part to compare only dates

    const isToday = selectedDate.getTime() === today.getTime();
    const isTomorrow =
      selectedDate.getTime() ===
      new Date(today.getTime() + 24 * 60 * 60 * 1000).getTime();

    const dayText = isToday
      ? "today"
      : isTomorrow
      ? "tomorrow"
      : "the day after tomorrow";

    return `Schedule for ${dayText} at ${selectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div
      className="scheduler-container"
      style={{ position: "relative", height: "100vh" }}
    >
      <h3>Schedule a Call</h3>

      <div
        className="time-grid"
        style={{
          overflowY: "scroll",
          maxHeight: "80vh",
          paddingBottom: "60px",
        }}
      >
        {timeBlocks.map((time, index) => (
          <div
            key={index}
            className={`time-block ${
              selectedTime && selectedTime.getTime() === time.getTime()
                ? "selected"
                : ""
            } ${
              time.getTime() - today.getTime() < 24 * 60 * 60 * 1000
                ? "today"
                : time.getTime() - today.getTime() < 48 * 60 * 60 * 1000
                ? "tomorrow"
                : "day-after-tomorrow"
            }`}
            onClick={() => handleTimeClick(time)}
          >
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ))}
      </div>

      <div
        className="scheduler-actions"
        style={{
          position: "fixed",
          bottom: "0px",
          width: "100%",
          background: "#fff",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          boxSizing: "border-box",
          left: "0", // Ensure buttons are aligned with the viewport
          zIndex: 1000, // Ensures the buttons are on top
        }}
      >
        {" "}
        <Button
          variant="outline-info"
          onClick={handleConfirm}
          disabled={!selectedTime}
        >
          {formatButtonText()}
        </Button>
        <Button variant="outline-danger" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Scheduler;
