export function getNavBar(){
    return `
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <img src="assets/images/logo.png" alt="Revisão Sistemas" width="60" height="50">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="home.html">Home</a>
                    </li> 
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="cliente.html">Clientes</a>
                    </li> 
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="pedido.html">Pedidos</a>
                    </li> 
                </ul>
            </div>
        </nav>
    `
}