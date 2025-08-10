const { registerUser } = require('../routes/auth'); // Adjust path as needed

describe('User Registration', () => {
  it('should fail if email is missing', async () => {
    const req = { body: { password: 'Password01G' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});