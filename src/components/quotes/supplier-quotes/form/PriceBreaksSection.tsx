
                    {format.num_products > 1 && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-1"></div>
                        <div className="md:col-span-11">
                          <div className="text-center text-xs font-medium text-muted-foreground mb-1">
                            Number of Products
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-1">
                            {Array.from({ length: Math.min(format.num_products || 1, 10) }, (_, i) => i + 1).map((i) => (
                              <div key={i} className="text-center">
                                <span className="text-xs font-medium text-muted-foreground">{i}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
