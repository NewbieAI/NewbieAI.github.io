def softmax(H):
    H_stable = H - H.max(axis=0, keepdims=True)    
    return np.exp(H_stable)/np.exp(H_stable).sum(axis=0,keepdims=True)

# loss functions******************************************************
# and gradient of loss functions
def MSE(H,Y):
    # defines the mean square error
    # loss function. It is the avg
    # L2 distance between predicted
    # value h_i and observed value
    # y_i
    L2 = ((H-Y)**2).sum(axis=0)
    return 0.5*L2.mean()

def gMSE(H,Y):
    # calculates the gradient of the
    # MSE loss function, used for
    # regression problems
    return (H-Y)/H.shape[1]
    

def x_entropy(H,Y):
    # defines the cross entropy loss
    # function, used for classification
    # problems.
    # calculates the cross entropy
    # between predicted distribution P
    # and observed distribution Y,
    # where H = log(P'), P' is the
    # unnormalized version of P
    if H.shape[0]==1:
        arg = H*(1-2*Y)
        return np.sum(softplus(arg))
    else:
        H_stable = H - H.max(axis = 0, keepdims = True)
        log_P = H_stable - np.log(np.exp(H_stable).sum(axis = 0, keepdims = True))
        return np.sum(Y*(-log_P))
    

def gx_entropy(H,Y):
    # calculates the gradient of the
    # cross entropy loss function
    if H.shape[0]==1:
        return sigmoid(H)-Y
    else:
        return softmax(H)-Y

output_units = [linear,
                sigmoid,
                softmax]
