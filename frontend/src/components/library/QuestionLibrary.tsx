import React, { useState } from 'react';

const QuestionLibrary = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const questions = [
    {
      id: 1,
      question: 'Explain the difference between var, let, and const in JavaScript',
      category: 'technical',
      difficulty: 'easy',
      tags: ['JavaScript', 'Variables'],
    },
    {
      id: 2,
      question: 'Describe a time when you had to handle a difficult team member',
      category: 'behavioral',
      difficulty: 'medium',
      tags: ['Teamwork', 'Communication'],
    },
    {
      id: 3,
      question: 'Design a URL shortening service like bit.ly',
      category: 'technical',
      difficulty: 'hard',
      tags: ['System Design', 'Scalability'],
    }
  ];

  if (selectedQuestion) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={() => setSelectedQuestion(null)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Library
        </button>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            {selectedQuestion.question}
          </h2>
          
          <div style={{ marginTop: '20px' }}>
            <span style={{ 
              backgroundColor: '#DBEAFE', 
              color: '#1E40AF',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '600',
              marginRight: '8px'
            }}>
              {selectedQuestion.difficulty}
            </span>
            <span style={{ 
              backgroundColor: '#FEF3C7', 
              color: '#92400E',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {selectedQuestion.category}
            </span>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Tags:</h3>
            <div>
              {selectedQuestion.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  style={{ 
                    backgroundColor: '#EFF6FF', 
                    color: '#1E40AF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginRight: '8px',
                    display: 'inline-block',
                    marginBottom: '8px'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#F9FAFB' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
          Question Library
        </h1>
        <p style={{ color: '#6B7280', marginTop: '8px' }}>
          Browse and practice interview questions
        </p>
      </div>

      {/* COMPREHENSIVE ROADMAP */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111827' }}>
          🚀 Interview Preparation Roadmap
        </h2>
        
        {/* Roadmap Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Step 1: Data Structures */}
          <div style={{ padding: '20px', backgroundColor: '#F0F9FF', borderRadius: '10px', borderLeft: '4px solid #3B82F6' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#1E40AF' }}>
              1. Data Structures
            </h3>
            <p style={{ color: '#374151', marginBottom: '15px', lineHeight: '1.6' }}>
              Data structures are the foundation of programming and problem-solving. Understanding how data is organized, stored, and manipulated will help you design efficient algorithms and write optimal code.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { name: 'Arrays', learn: 'https://www.geeksforgeeks.org/dsa/array-data-structure-guide/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Arrays&sortBy=submissions' },
                { name: 'Strings', learn: 'https://www.geeksforgeeks.org/dsa/string-data-structure/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Strings&sortBy=submissions' },
                { name: 'Linked List', learn: 'https://www.geeksforgeeks.org/dsa/linked-list-data-structure/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Linked%20List&sortBy=submissions' },
                { name: 'Stack', learn: 'https://www.geeksforgeeks.org/dsa/stack-data-structure/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Stack&sortBy=submissions' },
                { name: 'Queue', learn: 'https://www.geeksforgeeks.org/dsa/queue-data-structure/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Queue&sortBy=submissions' },
                { name: 'Tree', learn: 'https://www.geeksforgeeks.org/dsa/introduction-to-tree-data-structure/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Tree&sortBy=submissions' }
              ].map((item, index) => (
                <div key={index} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>{item.name}</p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <a href={item.learn} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none' }}>Learn</a>
                    <span style={{ color: '#D1D5DB' }}>|</span>
                    <a href={item.practice} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'none' }}>Practice</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Algorithms */}
          <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '10px', borderLeft: '4px solid #10B981' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#065F46' }}>
              2. Algorithms
            </h3>
            <p style={{ color: '#374151', marginBottom: '15px', lineHeight: '1.6' }}>
              Algorithms are step-by-step procedures to solve problems, and understanding them is critical to cracking coding rounds. Focus on both conceptual understanding and practical application.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { name: 'Searching Algorithms', learn: 'https://www.geeksforgeeks.org/dsa/searching-algorithms/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Searching&sortBy=submissions' },
                { name: 'Sorting Algorithms', learn: 'https://www.geeksforgeeks.org/dsa/sorting-algorithms/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Sorting&sortBy=submissions' },
                { name: 'Dynamic Programming', learn: 'https://www.geeksforgeeks.org/competitive-programming/dynamic-programming/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Dynamic%20Programming&sortBy=submissions' },
                { name: 'Greedy Algorithms', learn: 'https://www.geeksforgeeks.org/dsa/greedy-algorithms/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Greedy&sortBy=submissions' },
                { name: 'Backtracking', learn: 'https://www.geeksforgeeks.org/dsa/backtracking-algorithms/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Backtracking&sortBy=submissions' },
                { name: 'Graph Algorithms', learn: 'https://www.geeksforgeeks.org/dsa/graph-data-structure-and-algorithms/', practice: 'https://www.geeksforgeeks.org/explore?page=1&category=Graph&sortBy=submissions' }
              ].map((item, index) => (
                <div key={index} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>{item.name}</p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <a href={item.learn} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none' }}>Learn</a>
                    <span style={{ color: '#D1D5DB' }}>|</span>
                    <a href={item.practice} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'none' }}>Practice</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: CS Fundamentals */}
          <div style={{ padding: '20px', backgroundColor: '#FEF7FF', borderRadius: '10px', borderLeft: '4px solid #8B5CF6' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#7C3AED' }}>
              3. Computer Science Fundamentals
            </h3>
            <p style={{ color: '#374151', marginBottom: '15px', lineHeight: '1.6' }}>
              Core CS subjects provide theoretical and practical knowledge about how computers and networks operate.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>Operating Systems</h4>
                <a href="https://www.geeksforgeeks.org/operating-systems/operating-systems/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none' }}>Learn OS Concepts</a>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>Computer Networks</h4>
                <a href="https://www.geeksforgeeks.org/computer-networks/computer-network-tutorials/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none' }}>Learn Networking</a>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#111827' }}>Database Management</h4>
                <a href="https://www.geeksforgeeks.org/dbms/dbms/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none' }}>Learn DBMS</a>
              </div>
            </div>
          </div>

          {/* Step 4: System Design */}
          <div style={{ padding: '20px', backgroundColor: '#FFFBEB', borderRadius: '10px', borderLeft: '4px solid #F59E0B' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#92400E' }}>
              4. System Design
            </h3>
            <p style={{ color: '#374151', marginBottom: '15px', lineHeight: '1.6' }}>
              System design interviews test your ability to architect large-scale software solutions that are scalable, reliable, and maintainable.
            </p>
            <a href="https://www.geeksforgeeks.org/system-design/what-is-system-design-learn-system-design/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
              Learn System Design →
            </a>
          </div>

          {/* Step 5: Behavioral & HR */}
          <div style={{ padding: '20px', backgroundColor: '#FEF2F2', borderRadius: '10px', borderLeft: '4px solid #EF4444' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#DC2626' }}>
              5. Behavioral & HR Preparation
            </h3>
            <p style={{ color: '#374151', marginBottom: '15px', lineHeight: '1.6' }}>
              Prepare for managerial rounds and HR interviews with common behavioral questions and scenarios.
            </p>
            <a href="https://www.geeksforgeeks.org/hr/hr-interview-questions/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
              HR Interview Questions →
            </a>
          </div>
        </div>

        <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
          <p style={{ color: '#374151', fontSize: '14px', textAlign: 'center' }}>
            <strong>Pro Tip:</strong> After clearing all concepts, solve practice sets with Easy, Medium & Hard level problems.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px'
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Total Questions</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>6</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Bookmarked</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>3</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Practiced</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>4</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Avg. Time</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>15m</p>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <input 
          type="text"
          placeholder="Search questions..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #D1D5DB',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>

      {/* QUESTIONS */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          {questions.length} Questions Found
        </h2>
        
        {questions.map(question => (
          <div 
            key={question.id}
            onClick={() => setSelectedQuestion(question)}
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
          >
            <div style={{ marginBottom: '12px' }}>
              <span style={{ 
                backgroundColor: '#FEF3C7', 
                color: '#92400E',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600',
                marginRight: '8px'
              }}>
                {question.difficulty}
              </span>
              <span style={{ 
                backgroundColor: '#DBEAFE', 
                color: '#1E40AF',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {question.category}
              </span>
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              {question.question}
            </h3>
            
            <div>
              {question.tags.map((tag, idx) => (
                <span 
                  key={idx}
                  style={{ 
                    backgroundColor: '#EFF6FF', 
                    color: '#1E40AF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    marginRight: '8px',
                    display: 'inline-block'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ marginTop: '16px', color: '#2563EB', fontWeight: '600', fontSize: '14px' }}>
              View Details →
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default QuestionLibrary;