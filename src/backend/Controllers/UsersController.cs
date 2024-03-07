using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // [Authorize]
    public class UsersController:BaseApiController
    {
        private readonly DataContext context;

        public UsersController(DataContext context){
            this.context = context;
        }

        // [AllowAnonymous] //skloni ovo ako hoces da radi samo ako ima token
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers(){
            var users = await context.Users.ToListAsync();
            return users;
        }
        //[AllowAnonymous] 
        [HttpGet("{id}")] // /api/users/2
        public async Task<ActionResult<AppUser>> GetUser(int id){
            return await context.Users.FindAsync(id);
        }
    }
}