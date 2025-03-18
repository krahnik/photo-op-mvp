/**
 * Polls the transformation status endpoint until the transformation is complete
 * @param {string} transformationId - The ID of the transformation to check
 * @returns {Promise<Object>} - The transformation result
 */
export const pollTransformationStatus = async (transformationId) => {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  const interval = 5000; // 5 seconds
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`/api/status/${transformationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check transformation status');
      }

      const data = await response.json();

      if (data.status === 'completed') {
        return {
          status: 'completed',
          transformedImageUrl: data.transformedImageUrl
        };
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Transformation failed');
      }

      // If still processing, wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    } catch (error) {
      throw new Error(`Error checking transformation status: ${error.message}`);
    }
  }

  throw new Error('Transformation timed out');
}; 