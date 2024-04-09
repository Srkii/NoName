namespace backend.Entities
{
    public class Notification
    {
        public int Id{get;set;}
        public int UserId{get;set;}
        public DateTime dateTime{get;set;}
        public string Text{get;set;}//ovo je ustv samo tip notifikacije , promeniti posle...
        public bool read{get;set;}//na osnovu ovoga izvlacimo notifikacije, ako je procitana onda ne treba da se pojavljuje...ili mozda dodatni kriterijum vreme...

        public AppUser appUser{get;set;}
    }
}