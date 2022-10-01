// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Xml.Serialization;

// SI: comments on these classes. 
// 1. Each subclass of CounterExampleOutput seems to define it's own Variable. Why not just define it once outside
//namespace BioModelAnalyzer
//{
//    public class CExVariable
//    {
//        public string Id { get; set; }
//        public int Value { get; set; }
//    }
//}
//    and use it in each subclass? 
//
// 2. BifurcationCounterExample should be defined like this:
//public class BifurcationCounterExample : CounterExampleOutput
//{

//    public CExVariable[] fix1 { get; set; }
//    public CExVariable[] fix2 { get; set; }
//}   
// to mimic the data that comes back from the F# solver. 


namespace BioModelAnalyzer
{
    public enum FixPointType
    {
        Fixpoints, Unknown
    }

    public class fpOutput    
    {
        public class Variable
        {
            [XmlAttribute]
            public string Id { get; set; }

            [XmlAttribute]
            public int Value { get; set; }
        }

        [JsonConverter(typeof(StringEnumConverter))]
        public CounterExampleType Status { get; set; }

        public string Error { get; set; }
    }

    public class FixpointsExample : fpOutput
    {
        public Variable[] Variables { get; set; }
    }

    public class NoneExample : fpOutput
    {
        public Variable[] Variables { get; set; }
    }

}
