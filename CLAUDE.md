#Claude.md

Proyecto:
Aplicacion web tipo buscador de peliculas 

Rol del agente:
Desarrollador web con 12 años de experiencia

Objetivo:
Crea una aplicacion web que permita buscar peliculas por titulo y agregarlas como favoritas de forma sencilla y visual. Consumiendo los datos de una api externa (que luego te indicare)

Funcionalidades de la aplicación:
-Input de busqueda
-Consumo de API externa
-Home page con listados de los últimos estrenos
-Mostrar resultados de busqueda
-Filtros (año,ratings,categorias,etc)
-Vista de detalles con la sinopsis, iamgen de portada, etc
-Poder marcar si la he visto o no y si me gusta o no (checkbox corazon)
-Marcar peliculas como favoritas
-Visualizacion de las peliculas favoritas
-La informacion del usuario se guardara en data/mis_datos.json (la app sera para uso solo perosnal, no para multiples usuarios)


-Informacion del api externa :
El api que vamos a usar es TMDB (The movie database) , que el api es gratis.
-La url de la documentacion son estas (si no sabes como hacer algo con el api,investigalos en la documentacion de TMDB):
    -https://developers.themoviedb.org/reference/intro/getting-started
    -https://developers.themoviedb.org/docs/getting-started
    
-El API KEY para usar el api rest, lo tendras en el fichero.env que está en la raiz del proyecto. La variable que tienes que usar es API_KEY y debes usar la libreria dotenv para acceder a ella(si no está instalada, instalalà).



Stack de tecnología:
-HTML5
-CSS3
-JAVASCRIPT
-REACT


Preferencias generales:
-Todos los textos visibles en la web deben estar en español

Preferencias de diseño:
-Basate en las imagenes del diseño que tienes en la carpeta design del proyecto

Preferencias de estilos:
-Colores (los del diseño)
-Uso de medidas en rem, usando un font-size base de 10px
-Uso de HTML5 y CSS3 nativo.
-Uso de buenas practicas de maquetacion de css y si es necesario usa flexbox y css grid layout.
-Que la webapp sea responsive.


Preferencias de codigo:
-No añadas dependecias externas.
-HTML debe ser semantico.
-Usa siempre let o const, y no uses nunca var.
-No uses alert, confirm o prompt, todo el feedbak debe ser visual en el dom.
-Toda alerta o ventana modal que aparezca debe tener el mismo estilo que la web.
-No uses innerHTML, todo el contenido debe ser insertado con appendChild o previamente creando un elemento con document.createElement.
-Cuidado con olvidar prevenir el default en los eventos submit o click.
-Prioriza que el codigo sea sencillo de entender.
-Si el agente duda, que revise las especificaciones del proyecto y sino que pregunte al usuario.

Estructura de archivos: 
-carpeta design
-CLAUDE.md
-estrcutura de ficheros mas adecuadas para proyectos de react (lo elige el agente de IA)
