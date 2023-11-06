import '@testing-library/jest-dom'

jest.mock('next/font/google', () => ({
    Martel: jest.fn().mockImplementation(() => ({
      className: 'font-sans'
    })),
  }));
  
