import express from 'express'
import { User } from '../types'
import userService, { KCUserRepresentation } from '../services/user'

type PasswordResponse = {
  message: string
}

const index = async (req: express.Request, res: express.Response<User[]>, next: express.NextFunction) => {
  try {
    const user = await userService.find()
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

const getById = async (
  req: express.Request<{ idUser: string }>,
  res: express.Response<User>,
  next: express.NextFunction
) => {
  try {
    const user = await userService.findById(req.params.idUser)
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

const update = async (
  req: express.Request<{ idUser: string }, {}, KCUserRepresentation>,
  res: express.Response<User>,
  next: express.NextFunction
) => {
  try {
    const user = await userService.update(req.params.idUser, req.body)
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

const destroy = async (
  req: express.Request<{ idUser: string }>,
  res: express.Response<void>,
  next: express.NextFunction
) => {
  try {
    await userService.destroy(req.params.idUser)
    res.status(200).end()
  } catch (error) {
    next(error)
  }
}

const register = async (
  req: express.Request<{}, {}, KCUserRepresentation>,
  res: express.Response<User>,
  next: express.NextFunction
) => {
  try {
    const user = await userService.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

const me = async (req: express.Request, res: express.Response<User>) => {
  res.status(200).json(req._user)
}

const forgotPassword = async (req: express.Request, res: express.Response<PasswordResponse>) => {
  res.status(200).json({
    message: 'Should send magic link to generate new password',
  })
}

const resetPassword = async (req: express.Request, res: express.Response<PasswordResponse>) => {
  res.status(200).json({
    message: 'Should change password',
  })
}

export default {
  index,
  getById,
  update,
  destroy,
  register,
  me,
  forgotPassword,
  resetPassword,
}
