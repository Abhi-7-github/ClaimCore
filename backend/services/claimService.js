const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const Claim = require('../models/Claim');
const ApiError = require('../utils/apiError');

const uploadDirectory = path.join(__dirname, '../uploads');

const ensureUploadDirectory = async () => {
  await fs.mkdir(uploadDirectory, { recursive: true });
};

const uploadDocument = async (file) => {
  if (!file) {
    throw new ApiError(400, 'Claim document is required');
  }

  if (isCloudinaryConfigured()) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'claims',
          resource_type: 'auto',
        },
        (error, uploaded) => {
          if (error) {
            return reject(error);
          }

          return resolve(uploaded);
        }
      );

      uploadStream.end(file.buffer);
    });

    return {
      documentUrl: result.secure_url,
      storageType: 'cloudinary',
    };
  }

  await ensureUploadDirectory();

  const fileExtension = path.extname(file.originalname || '').toLowerCase();
  const safeFileName = `${Date.now()}-${randomUUID()}${fileExtension}`;
  const filePath = path.join(uploadDirectory, safeFileName);

  await fs.writeFile(filePath, file.buffer);

  const publicBaseUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const documentUrl = `${publicBaseUrl}/uploads/${safeFileName}`;

  return {
    documentUrl,
    storageType: 'local',
    filePath,
  };
};

const removeLocalUpload = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    return;
  }
};

const createClaim = async ({ user, payload, file }) => {
  const uploadedDocument = await uploadDocument(file);

  try {
    const claim = await Claim.create({
      patient: user.userId,
      name: payload.name,
      email: payload.email,
      claimAmount: Number(payload.claimAmount),
      description: payload.description,
      documentUrl: uploadedDocument.documentUrl,
      status: 'Pending',
      submittedAt: new Date(),
      submissionDate: new Date(),
    });

    return claim;
  } catch (error) {
    if (uploadedDocument.storageType === 'local') {
      await removeLocalUpload(uploadedDocument.filePath);
    }

    throw error;
  }
};

const getMyClaims = async (userId) => {
  return Claim.find({ patient: userId })
    .sort({ submittedAt: -1 })
    .populate('patient', 'name email role');
};

const getClaims = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  const amountQuery = {};

  if (filters.minAmount !== undefined) {
    amountQuery.$gte = Number(filters.minAmount);
  }

  if (filters.maxAmount !== undefined) {
    amountQuery.$lte = Number(filters.maxAmount);
  }

  if (Object.keys(amountQuery).length > 0) {
    query.claimAmount = amountQuery;
  }

  if (filters.date) {
    const date = new Date(filters.date);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.submittedAt = { $gte: start, $lte: end };
  }

  const searchTerm = filters.search || filters.patientName;

  if (searchTerm) {
    query.name = { $regex: searchTerm, $options: 'i' };
  }

  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Claim.find(query)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patient', 'name email role'),
    Claim.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getClaimById = async (id) => {
  const claim = await Claim.findById(id).populate('patient', 'name email role');

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  return claim;
};

const updateClaim = async (id, payload, user = null) => {
  const claim = await Claim.findById(id);

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  const isPatient = user?.role === 'patient';
  const isInsurer = user?.role === 'insurer';

  if (isPatient) {
    if (claim.patient.toString() !== String(user.userId)) {
      throw new ApiError(403, 'You are not allowed to update this claim');
    }

    if (claim.status !== 'Pending') {
      throw new ApiError(400, 'Only pending claims can be edited');
    }

    const editableFields = ['name', 'email', 'claimAmount', 'description'];
    const patientUpdates = Object.fromEntries(
      Object.entries(payload).filter(([key]) => editableFields.includes(key))
    );

    if (Object.keys(patientUpdates).length === 0) {
      throw new ApiError(400, 'No valid updates provided');
    }

    Object.entries(patientUpdates).forEach(([key, value]) => {
      claim[key] = key === 'claimAmount' ? Number(value) : value;
    });

    await claim.save();

    return Claim.findById(claim._id).populate('patient', 'name email role');
  }

  if (!isInsurer) {
    throw new ApiError(403, 'You are not allowed to update this claim');
  }

  if (payload.status !== undefined) {
    claim.status = payload.status;
  }

  if (payload.approvedAmount !== undefined) {
    claim.approvedAmount = Number(payload.approvedAmount);
  }

  if (payload.insurerComments !== undefined) {
    claim.insurerComments = payload.insurerComments;
  }

  if (payload.status || payload.approvedAmount !== undefined || payload.insurerComments !== undefined) {
    claim.reviewedAt = new Date();
  }

  if (claim.status === 'Approved' && payload.approvedAmount === undefined) {
    claim.approvedAmount = claim.approvedAmount || claim.claimAmount;
  }

  if (claim.status === 'Rejected' && payload.approvedAmount === undefined) {
    claim.approvedAmount = 0;
  }

  await claim.save();

  return Claim.findById(claim._id).populate('patient', 'name email role');
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaims,
  getClaimById,
  updateClaim,
};