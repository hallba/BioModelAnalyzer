// Copyright (c) Microsoft Research 2016
// License: MIT. See LICENSE
using bma.BioCheck;
using BMAWebApi;
using System;
using System.Web.Http;

namespace bma.client.Controllers
{
    public class ServerVersionController : ApiController
    {
        private readonly IFailureLogger faultLogger;

        public ServerVersionController(IFailureLogger logger)
        {
            if (logger == null) throw new ArgumentNullException("logger");
            this.faultLogger = logger;
        }

        public string Get()
        {            
            return "\n\nBMA Standalone version running locally\n\n";
        }
    }
}
