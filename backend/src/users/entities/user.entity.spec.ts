import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'password123';
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash the password before insert', async () => {
      await user.hashPassword();

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(user.password).toBe('hashed_password');
    });

    it('should not hash the password if it has not been modified', async () => {
      user.password = undefined;
      await user.hashPassword();

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const isValid = await user.validatePassword('password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'password123');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const isValid = await user.validatePassword('wrongpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'password123');
      expect(isValid).toBe(false);
    });
  });
});
