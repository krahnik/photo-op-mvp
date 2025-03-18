const axios = require('axios');
const { config } = require('../config');
const MonitoringService = require('./monitoringService');

class AIService {
  /**
   * Process image with advanced AI features
   * @param {Object} params - Processing parameters
   * @param {Buffer} params.image - Image buffer
   * @param {string} params.style - Selected style
   * @param {Object} params.adjustments - Style adjustments
   * @param {Object} params.quality - Quality settings
   * @returns {Promise<Object>} Processed image and metrics
   * @throws {Error} If face detection fails or quality checks fail
   */
  static async processImage(params) {
    try {
      // Initialize face detection with enhanced features
      const faceDetection = await this.detectFaces(params.image);
      
      // Parallel processing of expressions and demographics
      const [expressionAnalysis, demographicAnalysis] = await Promise.all([
        this.analyzeExpressions(faceDetection),
        this.analyzeDemographics(faceDetection)
      ]).catch(error => {
        console.error('Parallel processing error:', error);
        throw new Error('Failed to analyze face expressions and demographics');
      });
      
      // Generate face descriptors using FaceNet with quantization
      const faceDescriptors = await this.generateFaceDescriptors(faceDetection);
      
      // Apply style transfer with enhanced face preservation
      const result = await this.applyStyleTransfer(params, faceDescriptors, {
        expressionAnalysis,
        demographicAnalysis
      });
      
      // Validate results with enhanced metrics
      const validation = await this.validateResults(result, faceDetection, {
        expressionAnalysis,
        demographicAnalysis
      });
      
      return {
        image: result.transformed_image,
        quality_metrics: validation.quality_metrics,
        face_metrics: validation.face_metrics,
        demographic_metrics: validation.demographic_metrics,
        expression_metrics: validation.expression_metrics
      };
    } catch (error) {
      console.error('Error in image processing:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  /**
   * Check for NSFW content
   * @param {Buffer} image - Image buffer
   */
  static async checkNSFW(image) {
    try {
      const response = await axios.post(`${config.AI_SERVICE_URL}/nsfw-check`, {
        image,
        model: 'efficientnet',
        threshold: 0.8
      });
      return response.data;
    } catch (error) {
      console.error('NSFW check error:', error);
      throw error;
    }
  }

  /**
   * Assess image quality
   * @param {Buffer} image - Image buffer
   */
  static async assessImageQuality(image) {
    try {
      const response = await axios.post(`${config.AI_SERVICE_URL}/quality-assessment`, {
        image,
        metrics: ['sharpness', 'noise', 'contrast', 'exposure']
      });
      return response.data;
    } catch (error) {
      console.error('Quality assessment error:', error);
      throw error;
    }
  }

  /**
   * Check style consistency
   * @param {Buffer} image - Image buffer
   * @param {string} style - Selected style
   */
  static async checkStyleConsistency(image, style) {
    try {
      const response = await axios.post(`${config.AI_SERVICE_URL}/style-consistency`, {
        image,
        style,
        model: 'efficientnet'
      });
      return response.data;
    } catch (error) {
      console.error('Style consistency check error:', error);
      throw error;
    }
  }

  /**
   * Add watermark to image
   * @param {string} imageBase64 - Base64 encoded image
   */
  static async addWatermark(image, watermark) {
    try {
      const response = await axios.post(`${config.AI_SERVICE_URL}/watermark`, {
        image,
        watermark,
        position: 'bottom-right',
        opacity: 0.7
      });
      return response.data;
    } catch (error) {
      console.error('Watermark error:', error);
      throw error;
    }
  }

  /**
   * Detect faces in an image with advanced features
   * @param {Buffer} image - Image buffer
   * @returns {Promise<Object>} Face detection results including landmarks and orientation
   * @throws {Error} If face detection fails or no faces are found
   */
  static async detectFaces(image) {
    try {
      const response = await axios.post(`${config.AI_SERVICE_URL}/detect-faces`, {
        image,
        model: 'mtcnn',
        params: {
          confidence_threshold: 0.9,
          min_face_size: 20,
          use_landmarks: true,
          landmark_count: 478,
          track_orientation: true,
          max_faces: 10,
          optimize_spacing: true
        }
      });

      if (!response.data.faces || response.data.faces.length === 0) {
        throw new Error('No faces detected in the image');
      }

      return response.data;
    } catch (error) {
      console.error('Face detection error:', error);
      throw new Error(`Face detection failed: ${error.message}`);
    }
  }

  /**
   * Analyze facial expressions using blendshape coefficients
   * @param {Object} faceDetection - Face detection results
   * @returns {Promise<Object>} Expression analysis results with 52 blendshape coefficients
   * @throws {Error} If expression analysis fails
   */
  static async analyzeExpressions(faceDetection) {
    try {
      if (!faceDetection.faces || faceDetection.faces.length === 0) {
        throw new Error('No faces provided for expression analysis');
      }

      const response = await axios.post(`${config.AI_SERVICE_URL}/analyze-expressions`, {
        faces: faceDetection.faces,
        model: 'efficientnet',
        params: {
          blendshape_count: 52,
          use_quantization: true,
          parallel_processing: true
        }
      });

      // Validate response data
      if (!response.data.expressions || !Array.isArray(response.data.expressions)) {
        throw new Error('Invalid expression analysis results');
      }

      return response.data;
    } catch (error) {
      console.error('Expression analysis error:', error);
      throw new Error(`Expression analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze demographic information for detected faces
   * @param {Object} faceDetection - Face detection results
   * @returns {Promise<Object>} Demographic analysis results including age and gender
   * @throws {Error} If demographic analysis fails
   */
  static async analyzeDemographics(faceDetection) {
    try {
      if (!faceDetection.faces || faceDetection.faces.length === 0) {
        throw new Error('No faces provided for demographic analysis');
      }

      const response = await axios.post(`${config.AI_SERVICE_URL}/analyze-demographics`, {
        faces: faceDetection.faces,
        model: 'efficientnet',
        params: {
          age_ranges: ['0-2', '3-12', '13-19', '20-32', '33-45', '46-60', '60+'],
          gender_confidence_threshold: 0.9,
          use_quantization: true,
          parallel_processing: true,
          multi_face_analysis: true
        }
      });

      // Validate response data
      if (!response.data.demographics || !Array.isArray(response.data.demographics)) {
        throw new Error('Invalid demographic analysis results');
      }

      return response.data;
    } catch (error) {
      console.error('Demographic analysis error:', error);
      throw new Error(`Demographic analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate face descriptors using FaceNet with quantization
   * @param {Object} faceDetection - Face detection results
   * @returns {Promise<Object>} Face descriptors for style transfer
   * @throws {Error} If descriptor generation fails
   */
  static async generateFaceDescriptors(faceDetection) {
    try {
      if (!faceDetection.faces || faceDetection.faces.length === 0) {
        throw new Error('No faces provided for descriptor generation');
      }

      const response = await axios.post(`${config.AI_SERVICE_URL}/generate-descriptors`, {
        faces: faceDetection.faces,
        model: 'facenet',
        params: {
          embedding_size: 128,
          use_quantization: true,
          preserve_landmarks: true
        }
      });

      // Validate response data
      if (!response.data.descriptors || !Array.isArray(response.data.descriptors)) {
        throw new Error('Invalid face descriptors generated');
      }

      return response.data;
    } catch (error) {
      console.error('Descriptor generation error:', error);
      throw new Error(`Face descriptor generation failed: ${error.message}`);
    }
  }

  /**
   * Apply style transfer with enhanced face preservation and style blending
   * @param {Object} params - Processing parameters
   * @param {Object} faceDescriptors - Face descriptors
   * @param {Object} analysis - Expression and demographic analysis results
   * @returns {Promise<Object>} Style transfer results
   * @throws {Error} If style transfer fails
   */
  static async applyStyleTransfer(params, faceDescriptors, analysis) {
    try {
      if (!faceDescriptors.descriptors || faceDescriptors.descriptors.length === 0) {
        throw new Error('No face descriptors provided for style transfer');
      }

      // Build the prompt with style blending if enabled
      let prompt = params.style;
      if (params.customPrompt) {
        prompt = `${params.style}, ${params.customPrompt}`;
      }

      const response = await axios.post(`${config.AI_SERVICE_URL}/style-transfer`, {
        image: params.image,
        prompt: prompt,
        face_descriptors: faceDescriptors,
        expression_analysis: analysis.expressionAnalysis,
        demographic_analysis: analysis.demographicAnalysis,
        params: {
          strength: params.adjustments.strength,
          guidance_scale: params.adjustments.guidance_scale,
          num_inference_steps: params.adjustments.num_inference_steps,
          face_preservation: {
            enabled: true,
            weight: 0.8,
            landmark_preservation: true,
            expression_preservation: true,
            demographic_preservation: true,
            orientation_preservation: true
          },
          style_blending: {
            enabled: !!params.customPrompt,
            custom_prompt: params.customPrompt,
            blend_strength: 0.5
          },
          model: 'efficientnet',
          use_quantization: true,
          parallel_processing: true,
          use_controlnet: true,
          controlnet_config: {
            model: 'face_preservation',
            weight: 0.7,
            guidance_start: 0.2,
            guidance_end: 0.8,
            processor: 'face_landmarks',
            threshold: 0.5
          }
        }
      });

      // Validate response data
      if (!response.data.transformed_image) {
        throw new Error('Style transfer failed to generate transformed image');
      }

      return response.data;
    } catch (error) {
      console.error('Style transfer error:', error);
      throw new Error(`Style transfer failed: ${error.message}`);
    }
  }

  /**
   * Validate results with enhanced metrics
   * @param {Object} result - Style transfer results
   * @param {Object} faceDetection - Face detection results
   * @param {Object} analysis - Expression and demographic analysis results
   * @returns {Promise<Object>} Validation results with detailed metrics
   * @throws {Error} If validation fails
   */
  static async validateResults(result, faceDetection, analysis) {
    try {
      if (!result.transformed_image) {
        throw new Error('No transformed image provided for validation');
      }

      const response = await axios.post(`${config.AI_SERVICE_URL}/validate`, {
        original_faces: faceDetection.faces,
        transformed_image: result.transformed_image,
        expression_analysis: analysis.expressionAnalysis,
        demographic_analysis: analysis.demographicAnalysis,
        params: {
          check_landmarks: true,
          check_expressions: true,
          check_demographics: true,
          check_quality: true,
          check_orientation: true,
          check_multi_face: true,
          use_quantization: true,
          parallel_processing: true
        }
      });

      // Validate response data
      if (!response.data.quality_metrics || !response.data.face_metrics) {
        throw new Error('Invalid validation results');
      }

      return response.data;
    } catch (error) {
      console.error('Validation error:', error);
      throw new Error(`Result validation failed: ${error.message}`);
    }
  }
}

module.exports = AIService; 