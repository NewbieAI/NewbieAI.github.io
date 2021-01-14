@np.vectorize # using numpy vectorization as decorator
def linear(x):
    return x
@np.vectorize
def relu(x):
    return max(0,x)
@np.vectorize
def softplus(x):
    return math.log(1+math.exp(x))
@np.vectorize
def sigmoid(x):
    return 1/(1+math.exp(-x))
@np.vectorize
def tanh(x):
    return math.tanh(x)

# activation functions
afuncs = [linear,
          relu,
          softplus,
          sigmoid,
          tanh]

@np.vectorize
def dlinear(x):
    return 1
@np.vectorize
def drelu(x):
    return (x>=0)*1.
@np.vectorize
def dsoftplus(x):
    return 1/(1+math.exp(-x))    
@np.vectorize
def dsigmoid(x):
    sigm = 1/(1+math.exp(-x))
    return sigm*(1-sigm)
@np.vectorize
def dtanh(x):
    return 1-math.tanh(x)**2

# derivatives of activation functions
afuncs_prime = [dlinear,
                drelu,
                dsoftplus,
                dsigmoid,
                dtanh]
