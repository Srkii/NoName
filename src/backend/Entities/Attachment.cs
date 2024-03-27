using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class Attachment//zasebna tabela attachmenta posto relacija task-attachment nije 1-1
    {
        public int id{get;set;}
        public int task_id{get;set;}
        public string url{get;set;}
    }
}