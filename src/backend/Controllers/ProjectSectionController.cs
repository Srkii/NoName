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

        [HttpPost]
        public IActionResult CreateSection([FromBody] CreateSectionDto createSectionDto)
        {
            var section = new ProjectSection
            {
                SectionName = createSectionDto.SectionName,
                ProjectId = createSectionDto.ProjectId
            };
            _context.ProjectSections.Add(section);
            _context.SaveChanges();
            return Ok(section);
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

        [HttpDelete("{id}")] // DELETE: api/ProjectSection/5
        public async Task<IActionResult> DeleteSection(int id)
        {
            var section = await _context.ProjectSections.FindAsync(id);
            if (section == null)
            {
                return NotFound();
            }

            var tasks = await _context.ProjectTasks
                .Where(t => t.ProjectSectionId == id && t.ProjectId == section.ProjectId)
                .ToListAsync();

            tasks.ForEach(t => t.ProjectSectionId = null);
            _context.UpdateRange(tasks);

            _context.ProjectSections.Remove(section);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}