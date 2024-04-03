public class PaginationHeader{

    public PaginationHeader(int CurrentPage, int ItemsPerPage, int TotalItems, int TotalPages)
    {
        this.CurrentPage=CurrentPage;
        this.ItemsPerPage=ItemsPerPage;
        this.TotalPages=TotalPages;
        this.TotalItems=TotalItems;
    }

    public int CurrentPage { get; set; }
    public int ItemsPerPage { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
}