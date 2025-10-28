import '@testing-library/jest-dom'

jest.mock('next/font/google', () => ({
  Martel: jest.fn().mockImplementation(() => ({
    className: 'font-sans'
  }))
}))

// Silence state update warnings from react-facebook during tests by stubbing its components.
// These components are UI wrappers for the Facebook SDK and are not essential to unit behavior.
jest.mock('react-facebook', () => ({
  __esModule: true,
  FacebookProvider: ({ children }: any) => children,
  Parser: ({ children }: any) => children,
  Comments: () => null,
  CommentsCount: () => null,
  Page: () => null
}))

// Provide a lightweight mock for our AlertDialog wrappers to avoid
// accessibility warnings in tests while preserving structure.
jest.mock('@components/ui/alert-dialog', () => {
  const React = require('react')
  const AlertDialog = ({ children, onOpenChange, open, ...props }: any) =>
    React.createElement('div', { 'data-slot': 'alert-dialog', ...props }, children)

  const AlertDialogContent = ({ children, onOpenChange, open, ...props }: any) => {
    const normalizedChildren = React.Children.toArray(children)
    return React.createElement(
      'div',
      {
        'data-slot': 'alert-dialog-content',
        role: 'alertdialog',
        'aria-describedby': 'test-alert-description',
        ...props
      },
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'p',
          { id: 'test-alert-description', style: { display: 'none' } },
          'Test description'
        ),
        ...normalizedChildren
      )
    )
  }

  const pass = (tag: string) => (p: any) => React.createElement(tag, p)

  return {
    __esModule: true,
    AlertDialog,
    AlertDialogPortal: ({ children }: any) => children,
    AlertDialogOverlay: pass('div'),
    AlertDialogTrigger: pass('button'),
    AlertDialogContent,
    AlertDialogHeader: pass('div'),
    AlertDialogFooter: pass('div'),
    AlertDialogTitle: pass('h2'),
    AlertDialogDescription: pass('p'),
    AlertDialogAction: pass('button'),
    AlertDialogCancel: pass('button')
  }
})
