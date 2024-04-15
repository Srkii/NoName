using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class Attachment//zasebna tabela attachmenta posto relacija task-attachment nije 1-1
    { //tico: opet nemas spoljni kljuc i ne proveravas dal task postoji
        public int id{get;set;}
        public int task_id{get;set;}
        public ProjectTask Task{get;set;}//fk
        public int sender_id{get;set;}
        public AppUser Sender{get;set;}//fk
        public string url{get;set;}
    }
}