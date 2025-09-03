"use client";


    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {

    setIsLoading(true);
    setError(null);

    try {

    } finally {
      setIsLoading(false);
    }
  };


                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, index)}

                  </Button>
                </div>
              ))}
            </div>

      </CardContent>
    </Card>
  );
}
