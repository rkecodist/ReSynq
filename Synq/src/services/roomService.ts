// Define the shape of the expected response from the /create-room endpoint.
// Using an interface like this helps TypeScript catch potential errors if the
// backend response ever changes.
interface CreateRoomResponse {
  roomId: string;
}

/**
 * Sends a request to the server to create a new room.
 * This function is "async" because it performs a network request.
 * 
 * @param userId The unique ID of the user creating the room.
 * @returns A Promise that resolves with the new room's ID.
 * @throws An error if the server response is not successful.
 */
export async function createRoom(userId: string): Promise<string> {
  const response = await fetch('/create-room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }), // Send the userId in the request body
  });

  if (!response.ok) {
    // If the server returns an error (e.g., 500), we throw an error
    // to be caught by the component that called this function.
    throw new Error(`Server responded with status: ${response.status}`);
  }

  const data: CreateRoomResponse = await response.json();
  return data.roomId;
}

/**
 * Checks with the server if a given room ID is valid and exists.
 * 
 * @param roomId The ID of the room to check.
 * @returns A Promise that resolves to `true` if the room exists, `false` otherwise.
 * @throws An error if there's a server or network issue.
 */
export async function checkRoom(roomId: string): Promise<boolean> {
  const response = await fetch(`/check-room/${roomId}`);

  if (response.ok) {
    // A 200 OK status means the room exists.
    return true;
  }
  
  if (response.status === 404) {
    // A 404 Not Found status means the room does not exist.
    // We handle this gracefully by returning false instead of throwing an error.
    return false;
  }
  
  // For any other error status (e.g., 500), we throw an error.
  throw new Error(`Server responded with status: ${response.status}`);
}