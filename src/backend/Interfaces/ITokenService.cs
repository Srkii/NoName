using backend.Entities;

namespace backend;

public interface ITokenService
{
    string CreateToken(AppUser user);
}
