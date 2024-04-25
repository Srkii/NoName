using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class ProjectSectionController : BaseApiController
    {
        private readonly DataContext _context;

        public ProjectSectionController(DataContext context)
        {
            _context = context;
        }

        [HttpPost] // POST: api/ProjectSection
        public async Task<ActionResult<ProjectSection>> CreateSection(ProjectSectionDto sectionDto)
        {
            var section = new ProjectSection
            {
                SectionName = sectionDto.SectionName,
                ProjectId = sectionDto.ProjectId
            };

            _context.ProjectSections.Add(section);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSection), new { id = section.Id }, section);
        }

        [HttpGet("{id}")] // GET: api/ProjectSection/5
        public async Task<ActionResult<ProjectSection>> GetSection(int id)
        {
            var section = await _context.ProjectSections.FindAsync(id);

            if (section == null)
            {
                return NotFound();
            }

            return section;
        }

        [HttpGet("project/{id}")]//nzm nisam kreativan
        public async Task<ActionResult<IEnumerable<ProjectSection>>> GetSectionsByProject(int id){
            var sections = await _context.ProjectSections.Where(x => x.ProjectId == id).ToListAsync();
            return sections;
        }
    }
}