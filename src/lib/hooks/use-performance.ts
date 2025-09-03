
      setIsLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {

    try {
      performanceMonitor.resolveAlert(alertId);
      await refreshAlerts();
    } catch (error) {

      setIsLoading(false);
    }
  }, []);


  };
}
