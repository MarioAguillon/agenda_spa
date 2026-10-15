import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { usuariosRepository } from '../repositories/usuarios.repository';
import { AppError } from '../middlewares/error.middleware';
import { ENV } from '../config/env';
import { LoginInput } from '../schemas/auth.schema';

export class AuthService {
  async login(input: LoginInput) {
    const usuario = await usuariosRepository.findByEmail(input.email);
    if (!usuario || !usuario.activo) {
      throw new AppError('Credenciales incorrectas o usuario inactivo', 401);
    }

    const isPasswordValid = await argon2.verify(usuario.passwordHash, input.password);
    if (!isPasswordValid) {
      throw new AppError('Credenciales incorrectas', 401);
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    };
  }

  async getMe(userId: string) {
    const usuario = await usuariosRepository.findById(userId);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no encontrado o inactivo', 404);
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    };
  }
}

export const authService = new AuthService();
