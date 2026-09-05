import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import type {
  SignupDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './auth.dto.js';

/**
 * Auth controller — HTTP layer only.
 * Parses request, calls service, shapes response.
 * Contains zero business logic.
 */
export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.signup(req.body as SignupDto, 1);
      res.status(202).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(
        req.body as LoginDto,
        req.ip,
        req.requestId
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenDto;
      const result = await AuthService.refresh(refreshToken, req.requestId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenDto;
      await AuthService.logout(refreshToken);
      res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body as ForgotPasswordDto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body as ResetPasswordDto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const result = await AuthService.changePassword(userId, req.body as ChangePasswordDto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
