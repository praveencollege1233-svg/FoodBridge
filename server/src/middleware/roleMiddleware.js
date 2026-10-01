export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "You do not have permission to do this" });
  }

  return next();
};

export const requireVerifiedOrganization = (req, res, next) => {
  if (["donor", "ngo"].includes(req.user?.role) && req.user.verificationStatus !== "verified") {
    return res.status(403).json({ success: false, message: "Organization verification is required before using this workflow" });
  }

  return next();
};