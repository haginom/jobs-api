const { StatusCodes } = require("http-status-codes");
const Job = require("../models/Job");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  res.json(jobs);
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.find({
    createdBy: userId,
    _id: jobId,
  });
  //if job is empty
  if (job.length === 0) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }
  res.json(job);
};

const createJob = async (req, res) => {
  //add createdBy to req.body
  req.body.createdBy = req.user.userId;

  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === "" || position === "") {
    throw new BadRequestError("company or position fields are required");
  }

  const job = await Job.findByIdAndUpdate(
    {
      createdBy: userId,
      _id: jobId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }

  res.status(StatusCodes.ACCEPTED).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOneAndDelete({
    createdBy: userId,
    _id: jobId,
  });
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ msg: "Job deleted" });
};

module.exports = { getAllJobs, getJob, createJob, updateJob, deleteJob };
