import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.query.token !== process.env.REVALIDATE_KEY) {
    return res.status(401).json({ message: 'Invalid token ' })
  }
  const path = req.query.path as string

  if (typeof path !== 'string') {
    return res.status(401).json({ message: 'Invalid path ' })
  }

  await res.revalidate(path)
  return res.json({ revalidated: true })
}
