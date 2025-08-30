export function validate(schema) {
  return (req, res, next) => {
    const toValidate = {
      body: req.body,
      params: req.params,
      query: req.query,
    }
    const { error, value } = schema.validate(toValidate, { abortEarly: false, stripUnknown: true })
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message).join(", ") })
    }
    req.body = value.body || req.body
    req.params = value.params || req.params
    req.query = value.query || req.query
    next()
  }
}
