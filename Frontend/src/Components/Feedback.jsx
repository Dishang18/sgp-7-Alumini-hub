import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';

const Feedback = () => {
  const [experienceRating, setExperienceRating] = useState(5); // Scale 1-5
  const [agree, setAgree] = useState(null);
  const [stronglyAgree, setStronglyAgree] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // Handle the submission of feedback data (API call can be added here)
    setSubmitted(true);
    // Reset form if needed
    // setExperienceRating(5);
    // setAgree(null);
    // setStronglyAgree(null);
    // setFeedbackComments('');
    // setSelectedOption('');
  };

  const agreeDisagreeOptions = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-400">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-700">
          Provide your Valuable Feedback & Suggestions
        </h2>
        {submitted ? (
          <div className="text-green-600 text-center text-lg font-semibold py-8">
            Thank you for your feedback!
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit}>
            {/* Experience Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate your overall experience with Alumni Connect?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={experienceRating}
                  onChange={(e) => setExperienceRating(parseInt(e.target.value))}
                  className="w-1/2 h-3 bg-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <span className="text-lg font-semibold text-blue-700">{experienceRating}</span>
              </div>
            </div>

            {/* Agree/Disagree Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To what extent do you agree with the statements below?
              </label>
              <div className="flex flex-wrap gap-3">
                {agreeDisagreeOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="agree"
                      value={option}
                      checked={agree === option}
                      onChange={() => setAgree(option)}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-600">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Strongly Agree Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                For the following statements, please indicate how strongly you agree:
              </label>
              <div className="flex flex-wrap gap-3">
                {agreeDisagreeOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="stronglyAgree"
                      value={option}
                      checked={stronglyAgree === option}
                      onChange={() => setStronglyAgree(option)}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-600">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Feedback Comments */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have any additional comments or suggestions for improvement? (Optional)
              </label>
              <textarea
                rows="4"
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-300"
                placeholder="Type here..."
              />
            </div>

            {/* Meaningful Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please select the option that best describes your primary reason for using Alumni Connect:
              </label>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select an option</option>
                <option value="jobSeeking">Job Seeking</option>
                <option value="networking">Networking</option>
                <option value="keepingInTouch">Keeping in touch with classmates</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full flex items-center justify-center gap-2 transition"
            >
              <FaCheck className="inline-block mb-1" />
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;