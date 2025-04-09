// Type definitions for Jest custom matchers

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Checks if the value is a valid UUID
       */
      toBeUuid(): R;
    }
  }
}

// This needs to be an actual module with at least one export
export {};
