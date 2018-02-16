package com.customclasses.utils;

import com.microstrategy.utils.log.Level;
import com.microstrategy.utils.log.Logger;
import com.microstrategy.utils.log.LoggerConfigurator;

public class Log extends LoggerConfigurator {

	  public static final Logger logger = new Log().createLogger();  
	  public static Level ERROR_EXCEPTION = Level.SEVERE;
	  public static Level NON_FATAL_ERROR = Level.WARNING;
	  public static Level FLOW_DETAIL = Level.INFO;
	  public static Level INIT_APPL_COMPONENTS = Level.CONFIG;
	  public static Level TRACING = Level.FINE;
	  private static final String OUT = "Exiting";
	  private static final String IN = "Entering";

	  public static boolean isLoggable(Level logLevel)
	  {
	    return Log.logger.isLoggable(logLevel);
	  }

	  public static void generateErrorMsg(String className, String method, Throwable e)
	  {
	    generateErrorMsg(className, method, "", e);
	  }

	  public static void generateErrorMsg(String className, String method, String optionalText, Throwable e)
	  {
	    Log.logger.logp(Level.SEVERE, className, method, optionalText, e);
	  }

	  public static void generateLogMsg(Level logLevel, String className, String method, String msg)
	  {
	    if (msg != null && msg.length() > 0)
	    {
	      Log.logger.logp(logLevel, className, method, msg);
	    }
	  }

	  public static void entering(String className, String method)
	  {
	    if (Log.isLoggable(Level.FINE))
	    {
	      generateLogMsg(Level.FINE, className, method, IN);
	    }
	  }

	  public static void exiting(String className, String methodName)
	  {
	    if (Log.isLoggable(Level.FINE))
	    {
	      generateLogMsg(Level.FINE, className, methodName, OUT);
	    }
	  }

}
