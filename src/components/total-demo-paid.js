import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

import "./total-demo-paid.css";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons'

const TotalDemoPaidSubscibers = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    date: "",
    tradingViewId: "",
    referralId: "",
    phoneNumber: "",
    emailId: "",
    expiryDate: "",
  });
  const [remainingDays, setRemainingDays] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [errors, setErrors] = useState({});
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);

  // New state for filtering by date
  const [filterDate, setFilterDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("TotalDemoPaidSubscibers")) || [];
    setSubscribers(stored);
  }, []);

  const calculateRemainingDays = (expiry) => {
    const today = new Date();
    const exp = new Date(expiry);
    const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "expiryDate") {
      setRemainingDays(calculateRemainingDays(value));
    }
    if (name === "date") {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, expiryDate: nextDayStr }));
      setRemainingDays(calculateRemainingDays(nextDayStr));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const all = JSON.parse(localStorage.getItem("TotalDemoPaidSubscibers")) || [];

    if (all.some((s) => s.emailId === formData.emailId)) {
      newErrors.emailId = "Email ID is already registered.";
    }
    if (all.some((s) => s.phoneNumber === formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number is already registered.";
    }
    if (all.some((s) => s.referralId === formData.referralId)) {
      newErrors.referralId = "Referral ID must be unique.";
    }

    const sd = new Date(formData.date);
    const ed = new Date(formData.expiryDate);
    if (formData.date && formData.expiryDate && ed <= sd) {
      newErrors.expiryDate = "Expiry date must be after the start date.";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const newSubscriber = {
      ...formData,
      remainingDays: calculateRemainingDays(formData.expiryDate),
    };
    const updated = [...subscribers, newSubscriber];
    setSubscribers(updated);
    localStorage.setItem("TotalDemoPaidSubscibers", JSON.stringify(updated));

    setFormData({
      date: "",
      tradingViewId: "",
      referralId: "",
      phoneNumber: "",
      emailId: "",
      expiryDate: "",
    });
    setRemainingDays("");
    setErrors({});
  };

  const handleViewClick = (s) => setSelectedSubscriber(s);
  const handleCloseModal = () => setSelectedSubscriber(null);

  const handleDelete = (idx) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return;
    const updated = subscribers.filter((_, i) => i !== idx);
    setSubscribers(updated);
    localStorage.setItem("TotalDemoPaidSubscibers", JSON.stringify(updated));
  };

  // Filter logic: only display today's entries, then apply search if any
  const filteredSubscribers = subscribers
    .filter((s) => s.date === filterDate)
    .filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.referralId.toLowerCase().includes(q) ||
        s.phoneNumber.includes(q) ||
        s.emailId.toLowerCase().includes(q)
      );
    });

  return (
    <div className="subscription-wrapper">
      <motion.header
        className="animated-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="circle1" />
        <div className="circle2" />
        <div className="circle3" />
        <div className="diagonal-line" />
        <h1 className="header-title">
          <FaUsers style={{ marginRight: 10, color: "#fff" }} />
         Total Demo Subscibers
        </h1>
      </motion.header>

      <div className="header-container" style={{ marginLeft: "80%" }}>
        <button className="toggle-button m-4" onClick={() => {
            setShowForm(!showForm);
            // reset on toggle
            setFilterDate(todayStr);
            setSearchQuery("");
          }}>
          {showForm ? "View Subscribers" : "Return to Form"}
        </button>
      </div>

      {showForm ? (
        <div className="form-container">
          <h3 className="form-title">Add New Subscriber</h3>
          <form onSubmit={handleSubmit} className="styled-form">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>TradingView ID</label>
              <input
                type="text"
                name="tradingViewId"
                value={formData.tradingViewId}
                onChange={handleChange}
                minLength={5}
                maxLength={5}
                onKeyPress={(e) => /[0-9]/.test(e.key) || e.preventDefault()}
                required
              />
            </div>

            <div className="form-group">
              <label>Referral ID</label>
              <input type="text" name="referralId" value={formData.referralId} onChange={handleChange} required />
              {errors.referralId && <p className="error-text">{errors.referralId}</p>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                minLength={10}
                maxLength={10}
                onKeyPress={(e) => /[0-9]/.test(e.key) || e.preventDefault()}
                required
              />
              {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
            </div>

            <div className="form-group">
              <label>Email ID</label>
              <input type="email" name="emailId" value={formData.emailId} onChange={handleChange} required />
              {errors.emailId && <p className="error-text">{errors.emailId}</p>}
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} readOnly required />
              {errors.expiryDate && <p className="error-text">{errors.expiryDate}</p>}
            </div>

            <div className="form-group">
              <label>Remaining Days</label>
              <input type="text" value={remainingDays} readOnly />
            </div>

            <button className="submit-btn" type="submit">Submit</button>
          </form>
        </div>
      ) : (
        <div className="table-container">
          <div className="search-bar">
  <div className="search-input-wrapper">
    <input
      type="text"
      placeholder="Search within today's subscribers..."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />
<FaSearch className="search-icon" />
  </div>

  <div className="date-picker-wrapper">
    <input
      type="date"
      value={filterDate}
      onChange={e => setFilterDate(e.target.value)}
      min={todayStr}
      max={todayStr}
    />
 <FaCalendarAlt className="calendar-icon" />
  </div>
</div>


          <table className="subscriber-table">
            <thead>
              <tr>
                <th>Sl. No</th>
                <th>Date</th>
                <th>ReferralId</th>
                <th>TradingView ID</th>
                
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((s, i) => (
                <tr key={s.referralId}>
                  <td>{i + 1}</td>
                  <td>{s.date}</td>
                  <td>{s.referralId}</td>
                  <td>{s.tradingViewId}</td>
                  <td>
                    <button className="view-btn" onClick={() => handleViewClick(s)}>
                      View
                    </button>
                  
                    <button className="delete-btn" onClick={() => handleDelete(i)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
    <tr>
      <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "gray" }}>
        No subscribers found for the selected date or search.
      </td>
    </tr>
  )}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubscriber && (
        <Modal show onHide={handleCloseModal} centered>
          <Modal.Header>
            <Modal.Title>Subscriber Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              {Object.entries(selectedSubscriber).map(([key, value]) => (
                <Col xs={6} key={key}>
                  <p>
                    <strong>{key}:</strong> {value}
                  </p>
                </Col>
              ))}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default TotalDemoPaidSubscibers;
